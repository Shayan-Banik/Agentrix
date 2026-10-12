"use strict";
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiCall = createApiCall;
/**
 * Provides function wrappers that implement page streaming and retrying.
 */
const api_1 = require("@opentelemetry/api");
const apiCaller_1 = require("./apiCaller");
const gax_1 = require("./gax");
const retries_1 = require("./normalCalls/retries");
const timeout_1 = require("./normalCalls/timeout");
const streamingApiCaller_1 = require("./streamingCalls/streamingApiCaller");
const streaming_1 = require("./streamingCalls/streaming");
const warnings_1 = require("./warnings");
const TracerHelper_1 = require("./observability/TracerHelper");
const metadataResolver_1 = require("./observability/metadataResolver");
const util_1 = require("./util");
/**
 * Converts an rpc call into an API call governed by the settings.
 *
 * In typical usage, `func` will be a promise to a callable used to make an rpc
 * request. This will mostly likely be a bound method from a request stub used
 * to make an rpc call. It is not a direct function but a Promise instance,
 * because of its asynchronism (typically, obtaining the auth information).
 *
 * The result is a function which manages the API call with the given settings
 * and the options on the invocation.
 *
 * @param {Promise<GRPCCall>|GRPCCall} func - is either a promise to be used to make
 *   a bare RPC call, or just a bare RPC call.
 * @param {CallSettings} settings - provides the settings for this call
 * @param {Descriptor} [descriptor] - optionally specify the descriptor for
 *   the method call.
 * @param {boolean | 'proto' | 'rest'} [_fallback] - optionally specify whether
 *   the call uses HTTP/REST fallback transport rather than gRPC.
 * @return {GaxCall} func - a bound method on a request stub used
 *   to make an rpc call.
 */
function createApiCall(func, settings, descriptor, _fallback) {
    // we want to be able to accept both promise resolving to a function and a
    // function. Currently client librares are only calling this method with a
    // promise, but it will change.
    const funcPromise = typeof func === 'function' ? Promise.resolve(func) : func;
    // the following apiCaller will be used for all calls of this function...
    const apiCaller = (0, apiCaller_1.createAPICaller)(settings, descriptor);
    const tracingEnabled = (0, util_1.checkTelemetryEnabled)(settings);
    const staticArgs = tracingEnabled
        ? (0, metadataResolver_1.resolveStaticTraceContext)(settings)
        : undefined;
    const serviceName = settings.apiName?.split('.').pop() ?? '';
    const isFallback = Boolean(_fallback);
    const dynamicArgs = tracingEnabled
        ? {
            clientName: serviceName ? `${serviceName}Client` : '',
            methodName: settings.otherArgs?.internalMethodName ?? '',
            rpcType: isFallback ? 'http' : 'grpc',
        }
        : undefined;
    // Context for per-attempt low level network CLIENT spans.
    const attemptDynamicArgs = tracingEnabled && dynamicArgs
        ? {
            ...dynamicArgs,
            apiName: settings.apiName ?? '',
        }
        : undefined;
    const invokeCall = (request, callOptions, callback) => {
        // Capture the active client request span context to parent async low level network attempt spans.
        const parentContext = tracingEnabled ? api_1.context.active() : undefined;
        let currentApiCaller = apiCaller;
        let thisSettings;
        if (currentApiCaller instanceof streamingApiCaller_1.StreamingApiCaller) {
            const gaxStreamingRetries = currentApiCaller.descriptor?.gaxStreamingRetries ?? false;
            // If Gax streaming retries are enabled, check settings passed at call time and convert parameters if needed
            const convertedRetryOptions = (0, gax_1.convertRetryOptions)(callOptions, gaxStreamingRetries);
            thisSettings = settings.merge(convertedRetryOptions);
        }
        else {
            thisSettings = settings.merge(callOptions);
        }
        // special case: if bundling is disabled for this one call,
        // use default API caller instead
        if (settings.isBundling && !thisSettings.isBundling) {
            currentApiCaller = (0, apiCaller_1.createAPICaller)(settings, undefined);
        }
        const ongoingCall = currentApiCaller.init(callback);
        // Track resends per logical request so auto-paginated subsequent page
        // requests start at resendCount = 0 instead of being counted as retries.
        let attemptResendCount = 0;
        let isRetryAttempt = false;
        const recordResend = tracingEnabled
            ? () => {
                attemptResendCount++;
                isRetryAttempt = true;
            }
            : undefined;
        // Server-streaming calls retry inside the stream rather than through
        // `retryable`, so the recorder is handed to the stream proxy so each
        // resumed stream attempt span receives the incremented resendCount.
        if (recordResend && ongoingCall instanceof streaming_1.StreamProxy) {
            ongoingCall.recordResend = recordResend;
        }
        funcPromise
            .then((func) => {
            // Initially, the function is just what gRPC server stub contains.
            let wrappedFunc = currentApiCaller.wrap(func);
            const streaming = currentApiCaller.descriptor
                ?.streaming;
            // Wrap the transport call so each attempt (initial send and retries) emits a low level network CLIENT span.
            if (tracingEnabled && attemptDynamicArgs && staticArgs) {
                const callerWrappedFunc = wrappedFunc;
                wrappedFunc = (argument, metadata, options, attemptCallback) => {
                    if (!isRetryAttempt) {
                        attemptResendCount = 0;
                    }
                    isRetryAttempt = false;
                    const resendCount = attemptResendCount;
                    return (0, TracerHelper_1.traceAttempt)({ ...attemptDynamicArgs, resendCount }, staticArgs, tracedAttemptCallback => Reflect.apply(callerWrappedFunc, undefined, [
                        argument,
                        metadata,
                        options,
                        tracedAttemptCallback ?? attemptCallback,
                    ]), Boolean(streaming), attemptCallback, parentContext);
                };
            }
            const retry = thisSettings.retry;
            if (streaming && retry) {
                if (retry.retryCodes.length > 0 && retry.shouldRetryFn) {
                    (0, warnings_1.warn)('either_retrycodes_or_shouldretryfn', 'Only one of retryCodes or shouldRetryFn may be defined. Ignoring retryCodes.');
                    retry.retryCodes = [];
                }
                if (!currentApiCaller.descriptor
                    .gaxStreamingRetries &&
                    retry.getResumptionRequestFn) {
                    throw new Error('getResumptionRequestFn can only be used when gaxStreamingRetries is set to true.');
                }
            }
            if (!streaming && retry) {
                if (retry.shouldRetryFn) {
                    throw new Error('Using a function to determine retry eligibility is only supported with server streaming calls');
                }
                if (retry.getResumptionRequestFn) {
                    throw new Error('Resumption strategy can only be used with server streaming retries');
                }
                if (retry.retryCodes && retry.retryCodes.length > 0) {
                    retry.backoffSettings.initialRpcTimeoutMillis ??=
                        thisSettings.timeout;
                    return (0, retries_1.retryable)(wrappedFunc, thisSettings.retry, thisSettings.otherArgs, thisSettings.apiName, recordResend);
                }
            }
            return (0, timeout_1.addTimeoutArg)(wrappedFunc, thisSettings.timeout, thisSettings.otherArgs);
        })
            .then((apiCall) => {
            // After adding retries / timeouts, the call function becomes simpler:
            // it only accepts request and callback.
            return currentApiCaller.call(apiCall, request, thisSettings, ongoingCall);
        })
            .catch(err => {
            currentApiCaller.fail(ongoingCall, err);
        });
        // Calls normally return a "cancellable promise" that can be used to `await` for the actual result,
        // or to cancel the ongoing call.
        return currentApiCaller.result(ongoingCall);
    };
    if (tracingEnabled && dynamicArgs && staticArgs) {
        const isStreamingCall = apiCaller instanceof streamingApiCaller_1.StreamingApiCaller;
        return (request, callOptions, callback) => {
            return (0, TracerHelper_1.traceCall)(dynamicArgs, staticArgs, (tracedCallback) => {
                // `traceCall` wraps the user's callback whenever one was supplied,
                // for stream and non-stream calls alike, and that wrapper is what
                // closes the span. It is undefined only when there is no callback to
                // wrap, in which case the span is bound to the returned promise or
                // stream instead; the fallback keeps this correct either way.
                return invokeCall(request, callOptions, tracedCallback ?? callback);
            }, isStreamingCall, callback);
        };
    }
    else {
        return invokeCall;
    }
}
//# sourceMappingURL=createApiCall.js.map