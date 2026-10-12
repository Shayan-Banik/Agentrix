"use strict";
/**
 * Copyright 2026 Google LLC
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
exports.setAttemptHttpMethod = setAttemptHttpMethod;
exports.getGaxTracer = getGaxTracer;
exports.resolveErrorInfoReason = resolveErrorInfoReason;
exports.resolveServerErrorCode = resolveServerErrorCode;
exports.resolveClientNetworkOrOperationalError = resolveClientNetworkOrOperationalError;
exports.resolveLanguageSpecificErrorType = resolveLanguageSpecificErrorType;
exports.resolveErrorType = resolveErrorType;
exports.isPreConnectionFailure = isPreConnectionFailure;
exports.isServerSideError = isServerSideError;
exports.safeJsonStringify = safeJsonStringify;
exports.resolveServerExceptionDetails = resolveServerExceptionDetails;
exports.handlePromise = handlePromise;
exports.handleStream = handleStream;
exports.traceCall = traceCall;
exports.traceAttempt = traceAttempt;
const events_1 = require("events");
const api_1 = require("@opentelemetry/api");
const googleError_1 = require("../googleError");
const status_1 = require("../status");
const util_1 = require("../util");
const CLIENT_REQUEST_SPAN_KEY = (0, api_1.createContextKey)('google-gax-client-request-span');
const ATTEMPT_SPAN_KEY = (0, api_1.createContextKey)('google-gax-attempt-span');
const attemptUrlTemplates = new WeakMap();
const clientRequestFirstAttempt = new WeakMap();
/**
 * Formats the span name for an HTTP low level network attempt span as
 * `"{http.request.method} {url.template}"` when a URL template is available,
 * or `"{http.request.method}"` otherwise.
 *
 * @param {string} httpMethod - The HTTP request method (e.g. 'GET', 'POST').
 * @param {string} [urlTemplate] - Optional URL path template (e.g. '/v1/{name}:access').
 * @returns {string} The formatted HTTP attempt span name.
 */
function formatHttpAttemptSpanName(httpMethod, urlTemplate) {
    return urlTemplate ? `${httpMethod} ${urlTemplate}` : httpMethod;
}
/**
 * Propagates `url.template` from an HTTP attempt span to its parent client request span,
 * binding the parent span to the first child attempt span that resolves a URL template.
 *
 * @param {Span | undefined} clientRequestSpan - The parent client request span, if active.
 * @param {Span} attemptSpan - The child low level network HTTP attempt span.
 * @param {string | undefined} urlTemplate - The URL path template resolved for the attempt.
 */
function propagateUrlTemplateToClientSpan(clientRequestSpan, attemptSpan, urlTemplate) {
    if (!clientRequestSpan || !urlTemplate) {
        return;
    }
    const boundAttempt = clientRequestFirstAttempt.get(clientRequestSpan);
    if (!boundAttempt) {
        clientRequestFirstAttempt.set(clientRequestSpan, attemptSpan);
        clientRequestSpan.setAttribute('url.template', urlTemplate);
    }
    else if (boundAttempt === attemptSpan) {
        clientRequestSpan.setAttribute('url.template', urlTemplate);
    }
}
/**
 * Updates the `http.request.method` attribute, optional `url.template` attribute,
 * and span name on the currently active low level network attempt span, and
 * propagates `url.template` to the active client request span if this is the first
 * attempt span to resolve a URL template.
 *
 * @param {string} httpMethod - The HTTP request method (e.g. 'GET', 'POST').
 * @param {string} [urlTemplate] - Optional URL path template (e.g. '/v1/{name}:access').
 */
function setAttemptHttpMethod(httpMethod, urlTemplate) {
    const activeContext = api_1.context.active();
    const attemptSpan = activeContext.getValue(ATTEMPT_SPAN_KEY);
    const clientRequestSpan = activeContext.getValue(CLIENT_REQUEST_SPAN_KEY);
    if (attemptSpan) {
        attemptSpan.setAttribute('http.request.method', httpMethod);
        if (urlTemplate) {
            attemptUrlTemplates.set(attemptSpan, urlTemplate);
            attemptSpan.setAttribute('url.template', urlTemplate);
            propagateUrlTemplateToClientSpan(clientRequestSpan, attemptSpan, urlTemplate);
        }
        // Preserve any previously recorded URL template when updating the span name.
        const resolvedUrlTemplate = urlTemplate || attemptUrlTemplates.get(attemptSpan);
        attemptSpan.updateName(formatHttpAttemptSpanName(httpMethod, resolvedUrlTemplate));
    }
}
/**
 * Returns the OpenTelemetry Tracer instance for google-gax.
 *
 * @returns {Tracer} The OpenTelemetry Tracer.
 */
function getGaxTracer() {
    return api_1.trace.getTracer('google-gax');
}
/**
 * Decodes binary gRPC status details (`grpc-status-details-bin`) onto the error
 * object if present and not yet parsed.
 *
 * @param {unknown} e - The error to inspect and populate with parsed gRPC status details.
 */
function ensureGrpcStatusDetailsParsed(e) {
    if (!e || typeof e !== 'object') {
        return;
    }
    const errWithMeta = e;
    if (!errWithMeta.reason &&
        !errWithMeta.statusDetails &&
        errWithMeta.metadata &&
        typeof errWithMeta.metadata.get === 'function' &&
        errWithMeta.metadata.get('grpc-status-details-bin')?.length >
            0) {
        try {
            googleError_1.GoogleError.parseGRPCStatusDetails(errWithMeta);
        }
        catch {
            // Ignore decoding errors.
        }
    }
}
/**
 * Resolves google.rpc.ErrorInfo reason if present on the error or its cause chain.
 * Corresponds to Tier 1 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The ErrorInfo reason string if found, or undefined.
 */
function resolveErrorInfoReason(e) {
    ensureGrpcStatusDetailsParsed(e);
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        if (!current || typeof current !== 'object') {
            break;
        }
        // Guard against circular cause references.
        if (seen.has(current)) {
            break;
        }
        seen.add(current);
        const err = current;
        // Check direct reason property on error.
        if (typeof err.reason === 'string' && err.reason.length > 0) {
            return err.reason;
        }
        // Check errorInfo object on error.
        if (err.errorInfo && typeof err.errorInfo === 'object') {
            const infoReason = err.errorInfo.reason;
            if (typeof infoReason === 'string' && infoReason.length > 0) {
                return infoReason;
            }
        }
        // Inspect statusDetails array for reason or errorInfo.
        if (Array.isArray(err.statusDetails)) {
            for (const detail of err.statusDetails) {
                if (detail && typeof detail === 'object') {
                    if ('reason' in detail &&
                        typeof detail.reason === 'string' &&
                        detail.reason.length > 0) {
                        return detail.reason;
                    }
                    if ('errorInfo' in detail &&
                        detail.errorInfo &&
                        typeof detail.errorInfo.reason === 'string') {
                        return detail.errorInfo.reason;
                    }
                }
            }
        }
        // Traverse error cause chain.
        current = err.cause;
    }
    return undefined;
}
/**
 * Resolves a server error code received from the backend service:
 * - For HTTP: The HTTP status code string (e.g. '400', '403', '503').
 * - For gRPC: The canonical gRPC status code name in uppercase (e.g. 'PERMISSION_DENIED', 'UNAVAILABLE').
 * Corresponds to Tier 2 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {string | undefined} The server error code string if the error came from the server, or undefined.
 */
function resolveServerErrorCode(e, rpcType) {
    if (rpcType === 'http') {
        const httpStatus = resolveHttpStatusCode(e);
        return httpStatus !== undefined ? httpStatus.toString() : undefined;
    }
    if (rpcType === 'grpc') {
        if (isPreConnectionFailure(e) ||
            resolveClientNetworkOrOperationalError(e) !== undefined) {
            return undefined;
        }
        // Exclude client-side aborts across the cause chain (timeouts are already
        // matched by resolveClientNetworkOrOperationalError above).
        let current = e;
        const seen = new Set();
        for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
            if (!current || typeof current !== 'object' || seen.has(current)) {
                break;
            }
            seen.add(current);
            const err = current;
            if (err.name === 'AbortError') {
                return undefined;
            }
            current = err.cause;
        }
        return resolveRpcStatusName(e);
    }
    return undefined;
}
/**
 * Resolves client-side network and operational errors to standard CLIENT_* identifiers.
 * Corresponds to Tier 3 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The standardized CLIENT_* error type if matched, or undefined.
 */
function resolveClientNetworkOrOperationalError(e) {
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        if (!current || typeof current !== 'object') {
            break;
        }
        if (seen.has(current)) {
            break;
        }
        seen.add(current);
        const err = current;
        const name = typeof err.name === 'string' ? err.name : undefined;
        const constructorName = err.constructor?.name;
        const code = typeof err.code === 'string' ? err.code : undefined;
        const message = typeof err.message === 'string' ? err.message : '';
        // 1. CLIENT_TIMEOUT
        if (name === 'TimeoutError' ||
            code === 'ETIMEDOUT' ||
            code === 'ESOCKETTIMEDOUT' ||
            /timeout.*exceeded|deadline.*exceeded|total timeout/i.test(message)) {
            return 'CLIENT_TIMEOUT';
        }
        // 2. CLIENT_CONNECTION_ERROR
        if ((code && util_1.connectionCodes.includes(code)) ||
            (code && code.startsWith('ERR_SSL')) ||
            name === 'TLSError') {
            return 'CLIENT_CONNECTION_ERROR';
        }
        // 3. CLIENT_REQUEST_ERROR
        if ((code && util_1.requestCodes.includes(code)) ||
            name === 'URIError' ||
            constructorName === 'URIError') {
            return 'CLIENT_REQUEST_ERROR';
        }
        // 4. CLIENT_REQUEST_BODY_ERROR
        if (code && util_1.requestBodyCodes.includes(code)) {
            return 'CLIENT_REQUEST_BODY_ERROR';
        }
        // 5. CLIENT_RESPONSE_DECODE_ERROR
        if ((code && util_1.decodeCodes.includes(code)) ||
            name === 'DecodeError' ||
            constructorName === 'DecodeError' ||
            name === 'SyntaxError' ||
            constructorName === 'SyntaxError') {
            return 'CLIENT_RESPONSE_DECODE_ERROR';
        }
        // 6. CLIENT_REDIRECT_ERROR
        if (code && util_1.redirectCodes.includes(code)) {
            return 'CLIENT_REDIRECT_ERROR';
        }
        // 7. CLIENT_AUTHENTICATION_ERROR
        if (name === 'GoogleAuthError' ||
            constructorName === 'GoogleAuthError' ||
            code === 'ERR_NO_CREDENTIALS' ||
            code === 'MISSING_CREDENTIALS') {
            return 'CLIENT_AUTHENTICATION_ERROR';
        }
        current = err.cause;
    }
    return undefined;
}
/**
 * Resolves a language-specific error type name (e.g. AbortError, TypeError, RangeError, CustomRpcError).
 * Generic wrapper types (Error, GoogleError, Object, DOMException) are excluded and unwrap e.cause.
 * Corresponds to Tier 4 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The language-specific error class or name if found, or undefined.
 */
function resolveLanguageSpecificErrorType(e) {
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        if (!current || typeof current !== 'object') {
            break;
        }
        // Guard against circular cause references.
        if (seen.has(current)) {
            break;
        }
        seen.add(current);
        const err = current;
        // Prioritize AbortError regardless of class hierarchy.
        if (err.name === 'AbortError') {
            return 'AbortError';
        }
        // Prefer specific constructor class name over generic base wrappers.
        const className = err.constructor?.name;
        if (className && !util_1.genericClasses.includes(className)) {
            return className;
        }
        // Fall back to non-generic error name if available.
        if (typeof err.name === 'string' &&
            err.name.length > 0 &&
            !util_1.genericClasses.includes(err.name)) {
            return err.name;
        }
        // Unwrap cause chain when encountering generic wrapper classes.
        current = err.cause;
    }
    return undefined;
}
/**
 * Resolves the OpenTelemetry `error.type` attribute according to the 5-tier hierarchy:
 * 1. google.rpc.ErrorInfo.reason
 * 2. Specific Server Error Code (HTTP status code or gRPC status name)
 * 3. Client-Side Network/Operational Errors (CLIENT_* standardized strings)
 * 4. Language-specific error type (e.g. AbortError, RangeError, TypeError, CustomRpcError)
 * 5. Internal Fallback ("INTERNAL")
 *
 * @param {unknown} e - The error to classify.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {string} The resolved `error.type` value.
 */
function resolveErrorType(e, rpcType) {
    // Tier 1: google.rpc.ErrorInfo.reason
    const errorInfoReason = resolveErrorInfoReason(e);
    if (errorInfoReason) {
        return errorInfoReason;
    }
    // Tier 2: Specific Server Error Code
    const serverErrorCode = resolveServerErrorCode(e, rpcType);
    if (serverErrorCode) {
        return serverErrorCode;
    }
    // Tier 3: Client-Side Network/Operational Errors
    const clientError = resolveClientNetworkOrOperationalError(e);
    if (clientError) {
        return clientError;
    }
    // Tier 4: Language-specific error type
    const languageError = resolveLanguageSpecificErrorType(e);
    if (languageError) {
        return languageError;
    }
    // Tier 5: Internal Fallback
    return 'INTERNAL';
}
/**
 * Resolves the exception type name for a failed call. Prefers specific
 * exception names (e.g. `AbortError`, `TimeoutError`, `TypeError`) and
 * constructor names over generic `Error`, falling back to `e.name` when
 * the constructor is generic or `DOMException`.
 *
 * @param {Error} e - The Error instance.
 * @returns {string} The resolved `exception.type` string.
 */
function resolveExceptionType(e) {
    if (e.name && (e.name === 'AbortError' || e.name === 'TimeoutError')) {
        return e.name;
    }
    const className = e.constructor?.name;
    if (className &&
        className !== 'Error' &&
        className !== 'Object' &&
        className !== 'DOMException') {
        return className;
    }
    return e.name || 'Error';
}
/**
 * Resolves a Node system error code (e.g. `ECONNREFUSED`), checking the error
 * itself and any underlying cause attached by fallback wrapping.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The system error code string if present, or undefined.
 */
function resolveSystemErrorCode(e) {
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        if (!current || typeof current !== 'object') {
            break;
        }
        if (seen.has(current)) {
            break;
        }
        seen.add(current);
        const code = current.code;
        if (typeof code === 'string' && code.length > 0) {
            return code;
        }
        current = current.cause;
    }
    return undefined;
}
/**
 * Resolves the canonical gRPC status name for a failed call. Status 0 (OK)
 * and codes outside the `Status` enum are treated as absent for failed calls.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The canonical gRPC status name if present, or undefined.
 */
function resolveRpcStatusName(e) {
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        if (!current || typeof current !== 'object') {
            break;
        }
        if (seen.has(current)) {
            break;
        }
        seen.add(current);
        const code = current.code;
        if (typeof code === 'number' &&
            code !== status_1.Status.OK &&
            status_1.Status[code] !== undefined) {
            return status_1.Status[code];
        }
        current = current.cause;
    }
    return undefined;
}
/**
 * Reads the HTTP response status recorded on a fallback error.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {number | undefined} The numeric HTTP status code if present, or undefined.
 */
function resolveHttpStatusCode(e) {
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        if (!current || typeof current !== 'object') {
            break;
        }
        if (seen.has(current)) {
            break;
        }
        seen.add(current);
        const code = current.httpStatusCode;
        if (typeof code === 'number') {
            return code;
        }
        current = current.cause;
    }
    return undefined;
}
/**
 * Determines if a failure occurred on the client side before DNS resolution
 * or connection establishment.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {boolean} True if the error occurred before connection establishment.
 */
function isPreConnectionFailure(e) {
    let current = e;
    const seen = new Set();
    for (let depth = 0; depth < util_1.DEPTH_TO_CHECK; depth++) {
        // Server status code indicates a response was received.
        if (resolveHttpStatusCode(current) !== undefined ||
            resolveRpcStatusName(current) !== undefined) {
            return false;
        }
        // Non-Error throws or objects without stack are client failures.
        if (!current ||
            !(current instanceof Error ||
                (typeof current === 'object' && 'stack' in current))) {
            return true;
        }
        // Guard against circular cause references.
        if (seen.has(current)) {
            return false;
        }
        seen.add(current);
        // Client-side validation errors happen before connection.
        const err = current;
        if (current instanceof TypeError ||
            current instanceof RangeError ||
            current instanceof URIError ||
            err.name === 'TypeError' ||
            err.name === 'RangeError' ||
            err.name === 'URIError') {
            return true;
        }
        // Check for network error codes occurring before connection establishment.
        const systemCode = resolveSystemErrorCode(current);
        if (systemCode && util_1.preConnectionCodes.includes(systemCode)) {
            return true;
        }
        // Unwrap GoogleError wrappers to inspect underlying cause.
        if ((current instanceof googleError_1.GoogleError ||
            current.constructor?.name ===
                'GoogleError') &&
            err.cause) {
            current = err.cause;
        }
        else {
            return false;
        }
    }
    return false;
}
/**
 * Resolves a human-readable description for non-Error throws, extracting
 * `message` if present or falling back to `String(e)`.
 *
 * @param {unknown} e - The non-Error value thrown or reported.
 * @returns {string} The resolved error message string.
 */
function resolveErrorMessage(e) {
    const message = e?.message;
    return typeof message === 'string' ? message : String(e);
}
/**
 * Determines whether a failure is a server-side error (i.e. a server response arrived),
 * excluding pre-connection failures, client network/operational errors, and aborts/timeouts.
 *
 * @param {unknown} e - The error to inspect.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {boolean} True if a server error code was resolved for the transport.
 */
function isServerSideError(e, rpcType) {
    return resolveServerErrorCode(e, rpcType) !== undefined;
}
/**
 * Checks whether a value is a Node.js Buffer instance.
 *
 * @param {unknown} val - The value to check.
 * @returns {boolean} True if `val` is a Buffer.
 */
function isBuffer(val) {
    return typeof Buffer !== 'undefined' && Buffer.isBuffer(val);
}
/**
 * Safely converts a value to a JSON string without throwing exceptions on
 * circular references, BigInt values, or non-serializable properties.
 *
 * @param {unknown} value - The value to serialize.
 * @returns {string | undefined} The serialized JSON string, or undefined if `value` is undefined or unserializable.
 */
function safeJsonStringify(value) {
    if (value === undefined) {
        return undefined;
    }
    try {
        const ancestors = [];
        return JSON.stringify(value, function (_key, val) {
            if (typeof val === 'bigint') {
                return val.toString();
            }
            if (typeof val !== 'object' || val === null) {
                return val;
            }
            // Track object ancestry to replace circular references.
            if (ancestors.includes(this)) {
                while (ancestors.length > 0 &&
                    ancestors[ancestors.length - 1] !== this) {
                    ancestors.pop();
                }
            }
            if (ancestors.includes(val)) {
                return '[Circular]';
            }
            ancestors.push(val);
            return val;
        });
    }
    catch {
        try {
            return String(value);
        }
        catch {
            return undefined;
        }
    }
}
/**
 * Extracts and formats server-side error details (message, status details, and metadata)
 * attached by GFE/backend on server-side errors. Note that only `message` is used on
 * low level network `exception` span events (`exception.stacktrace` is not recorded on spans).
 *
 * @param {Error} e - The server Error instance.
 * @returns {{message: string; stacktrace?: string}} The resolved server message and formatted details string.
 */
function resolveServerExceptionDetails(e) {
    ensureGrpcStatusDetailsParsed(e);
    const errObj = e;
    const causeObj = errObj.cause && typeof errObj.cause === 'object'
        ? errObj.cause
        : undefined;
    // Prefer server error details over generic error message.
    const serverDetails = errObj.details ?? causeObj?.details;
    const message = typeof serverDetails === 'string' && serverDetails.length > 0
        ? serverDetails
        : e.message;
    // Serialize status details if present.
    const rawStatusDetails = errObj.statusDetails ?? causeObj?.statusDetails;
    let statusDetailsStr;
    if (rawStatusDetails !== undefined && rawStatusDetails !== null) {
        statusDetailsStr =
            typeof rawStatusDetails === 'string'
                ? rawStatusDetails
                : safeJsonStringify(rawStatusDetails);
    }
    // Serialize backend metadata, encoding Buffer values as base64.
    const rawMetadata = errObj.metadata ?? causeObj?.metadata;
    let metadataStr;
    if (rawMetadata && typeof rawMetadata === 'object') {
        try {
            let map;
            if (typeof rawMetadata.getMap === 'function') {
                map = rawMetadata.getMap();
            }
            else {
                map = rawMetadata;
            }
            const cleanMap = {};
            for (const [key, val] of Object.entries(map)) {
                if (isBuffer(val)) {
                    cleanMap[key] = val.toString('base64');
                }
                else if (Array.isArray(val)) {
                    cleanMap[key] = val.map(item => isBuffer(item) ? item.toString('base64') : item);
                }
                else {
                    cleanMap[key] = val;
                }
            }
            metadataStr = safeJsonStringify(cleanMap);
        }
        catch {
            metadataStr = safeJsonStringify(rawMetadata);
        }
    }
    // Combine status details and metadata into a formatted stacktrace string.
    const stacktraceParts = [];
    if (statusDetailsStr) {
        stacktraceParts.push(`status_details: ${statusDetailsStr}`);
    }
    if (metadataStr) {
        stacktraceParts.push(`metadata: ${metadataStr}`);
    }
    const stacktrace = stacktraceParts.length > 0 ? stacktraceParts.join('\n') : undefined;
    return {
        message,
        stacktrace,
    };
}
/**
 * Records an `exception` span event with `exception.type` (and `exception.message`
 * when `includeMessage` is true, such as on low level network attempt spans).
 *
 * @param {Span} span - The span on which to record the exception event.
 * @param {Error} e - The error instance.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @param {boolean} [includeMessage=false] - Whether to include `exception.message` on the event
 *   (true for low level network attempt spans, false for client request spans).
 */
function recordExceptionEvent(span, e, rpcType, includeMessage = false) {
    const attributes = {
        'exception.type': resolveExceptionType(e),
    };
    if (includeMessage) {
        attributes['exception.message'] = isServerSideError(e, rpcType)
            ? resolveServerExceptionDetails(e).message
            : e.message;
    }
    span.addEvent('exception', attributes);
}
/**
 * Checks if a value behaves like a Promise or Thenable.
 *
 * Note: It is not sufficient to check `result instanceof Promise` because:
 * 1. Custom classes implementing `CancellablePromise` or Thenables may not
 *    inherit directly from the native JavaScript `Promise` prototype.
 * 2. GAX callers or custom callers may return objects such as `OngoingCallPromise`
 *    that hold the actual promise on a `.promise` property.
 * 3. Promises originating from different execution realms (such as Node.js vm
 *    contexts or different package bundles) fail `instanceof Promise` checks.
 *
 * @template T
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if `value` is a Promise or Thenable.
 */
function isPromiseLike(value) {
    return (value instanceof Promise ||
        (value !== null &&
            (typeof value === 'object' || typeof value === 'function') &&
            typeof value.then === 'function'));
}
/**
 * Extracts a PromiseLike target from a value, supporting native Promises,
 * custom Thenables, classes implementing CancellablePromise, and OngoingCallPromise wrappers.
 *
 * @template T
 * @param {unknown} value - The operation return value to inspect.
 * @returns {PromiseLike<T> | null} The underlying PromiseLike target, or null if not promise-like.
 */
function getPromiseTarget(value) {
    if (isPromiseLike(value)) {
        return value;
    }
    // Unwrap `.promise` property on wrappers like OngoingCallPromise.
    if (value !== null &&
        (typeof value === 'object' || typeof value === 'function') &&
        'promise' in value &&
        isPromiseLike(value.promise)) {
        return value.promise;
    }
    return null;
}
/**
 * Manages span lifecycle for Promise-based operations, ending the span on
 * resolution or recording the error and ending the span on rejection.
 *
 * @template T
 * @param {T} promise - The promise returned from the traced operation.
 * @param {function} recordError - Callback to record errors on the span.
 * @param {function} endSpan - Callback to end the span idempotently.
 */
function handlePromise(promise, recordError, endSpan) {
    let spanEnded = false;
    const endSpanOnce = () => {
        if (!spanEnded) {
            spanEnded = true;
            endSpan();
        }
    };
    const target = getPromiseTarget(promise) ?? promise;
    Promise.resolve(target)
        .then(() => {
        endSpanOnce();
        return null;
    })
        .catch(err => {
        if (!spanEnded) {
            recordError(err);
            endSpanOnce();
        }
    });
}
/**
 * Manages span lifecycle for Stream-based operations and cleans up event listeners.
 * For client-streaming calls without a callback, `'finish'` is used as the completion
 * signal because readable events (`'end'`) never fire on write-only streams.
 *
 * @param {EventEmitter} stream - The stream returned from the traced operation.
 * @param {function} recordError - Callback to record errors on the span.
 * @param {function} endSpan - Callback to end the span idempotently.
 * @param {boolean} [hasCallback=false] - Whether the caller supplied a callback
 *   for this call. When true, 'finish' is not treated as a completion signal.
 */
function handleStream(stream, recordError, endSpan, hasCallback = false) {
    let spanEnded = false;
    // Use 'finish' only for write-only streams without a callback.
    const isWriteOnly = 'writable' in stream &&
        stream.writable === true &&
        (!('readable' in stream) || stream.readable !== true);
    const useFinish = isWriteOnly && !hasCallback;
    const cleanup = () => {
        stream.removeListener('error', onError);
        stream.removeListener('end', endSpanOnce);
        stream.removeListener('close', endSpanOnce);
        stream.removeListener('finish', endSpanOnce);
    };
    const endSpanOnce = () => {
        if (!spanEnded) {
            spanEnded = true;
            cleanup();
            endSpan();
        }
    };
    const onError = (err) => {
        if (!spanEnded) {
            recordError(err);
            endSpanOnce();
        }
    };
    stream.on('error', onError);
    stream.on('end', endSpanOnce);
    stream.on('close', endSpanOnce);
    if (useFinish) {
        stream.on('finish', endSpanOnce);
    }
}
/**
 * Resolves and parses the server address, port, and target service domain (`url.domain`)
 * from dynamic and static trace contexts, splitting `"host:port"` or `"[ipv6]:port"`
 * strings. When `defaultPort` is provided (for low level network attempt spans), falls back to `url.domain`
 * for the server address and defaults the port to `defaultPort` if not otherwise specified.
 *
 * @param {DynamicTraceContext} dynamicArgs - Dynamic trace context for the call or attempt.
 * @param {StaticTraceContext} staticArgs - Static trace context for the client library.
 * @param {number} [defaultPort] - Optional default port (e.g. 443 for low level network attempt spans).
 * @returns {{rawAddress?: string; rawPort?: number; urlDomain?: string}} Resolved address, port, and domain.
 */
function resolveEndpointAndDomain(dynamicArgs, staticArgs, defaultPort) {
    let rawAddress = dynamicArgs.serverAddress ?? staticArgs.serverAddress;
    let rawPort = dynamicArgs.serverPort ?? staticArgs.serverPort;
    const splitHostAndPort = (addr) => {
        const match = addr.match(/^(\[[^\]]+\]|[^:]+):(\d+)$/);
        if (match) {
            rawAddress = match[1];
            rawPort = rawPort ?? Number(match[2]);
        }
        else {
            rawAddress = addr;
        }
    };
    if (rawAddress) {
        // Split embedded port from "host:port" or "[ipv6]:port" if present.
        splitHostAndPort(rawAddress);
    }
    let urlDomain = dynamicArgs.urlDomain ?? staticArgs.urlDomain ?? rawAddress;
    if (!urlDomain && staticArgs.gcpClientService) {
        // Append ".googleapis.com" when gcpClientService is a short service name.
        urlDomain = staticArgs.gcpClientService.includes('.')
            ? staticArgs.gcpClientService
            : `${staticArgs.gcpClientService}.googleapis.com`;
    }
    if (defaultPort !== undefined) {
        if (!rawAddress && urlDomain) {
            splitHostAndPort(urlDomain);
        }
        if (rawAddress) {
            rawPort = rawPort ?? defaultPort;
        }
    }
    return { rawAddress, rawPort, urlDomain };
}
/**
 * Builds the common initial client, transport, and domain attributes shared by
 * client request spans and low level network attempt spans.
 *
 * @param {DynamicTraceContext} dynamicArgs - Dynamic trace context for the call or attempt.
 * @param {StaticTraceContext} staticArgs - Static trace context for the client library.
 * @param {string} [urlDomain] - Resolved `url.domain` attribute value, if available.
 * @returns {Attributes} The initial span attributes map.
 */
function buildInitialAttributes(dynamicArgs, staticArgs, urlDomain) {
    const attributes = {
        'gcp.client.service': staticArgs.gcpClientService,
        'gcp.client.version': staticArgs.gcpVersion,
        'gcp.client.repo': staticArgs.gcpRepo,
        'gcp.client.artifact': staticArgs.gcpArtifact,
        'rpc.system.name': dynamicArgs.rpcType,
    };
    if (urlDomain !== undefined) {
        attributes['url.domain'] = urlDomain;
    }
    return attributes;
}
/**
 * Returns the transport-specific resend count attribute key.
 *
 * Named per transport, the same way the status attributes are.
 * `http.request.resend_count` is the stable OpenTelemetry attribute for
 * exactly this quantity, so the fallback uses it rather than inventing a
 * parallel name. gRPC has no standard equivalent, so it takes the gcp.*
 * name instead of borrowing the http.* one, which would claim a protocol
 * the call never spoke.
 *
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {string} The resend count attribute key (`gcp.grpc.resend_count` or `http.request.resend_count`).
 */
function resolveResendCountAttribute(rpcType) {
    return rpcType === 'grpc'
        ? 'gcp.grpc.resend_count'
        : 'http.request.resend_count';
}
/**
 * Sets final response status code and server endpoint attributes on a span.
 * `server.address` and `server.port` are present on server-side errors and successful calls,
 * but omitted on client-side failures that occur before DNS resolution or connection establishment.
 *
 * @param {Span} span - The span on which to set final attributes.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @param {string | undefined} rpcStatusName - Resolved gRPC status name, if any.
 * @param {number | undefined} httpStatusCode - Resolved HTTP status code, if any.
 * @param {string | undefined} rawAddress - Parsed server address, if configured.
 * @param {number | undefined} rawPort - Parsed server port, if configured.
 * @param {boolean} errorRecorded - Whether an error was recorded on the span.
 * @param {unknown} recordedError - The error recorded on the span, if any.
 */
function setFinalStatusAttributes(span, rpcType, rpcStatusName, httpStatusCode, rawAddress, rawPort, errorRecorded, recordedError) {
    const attributes = {};
    if (rpcType === 'grpc' && rpcStatusName !== undefined) {
        attributes['rpc.response.status_code'] = rpcStatusName;
    }
    if (rpcType === 'http' && httpStatusCode !== undefined) {
        attributes['http.response.status_code'] = httpStatusCode;
    }
    // Omit server endpoint on client-side pre-connection failures.
    if (rawAddress !== undefined &&
        (!errorRecorded || !isPreConnectionFailure(recordedError))) {
        attributes['server.address'] = rawAddress;
        if (rawPort !== undefined) {
            attributes['server.port'] = rawPort;
        }
    }
    span.setAttributes(attributes);
}
/**
 * Records error attributes (`error.type`, `status.message`), `exception` span event,
 * and `ERROR` status on a span, returning the resolved transport status codes.
 *
 * @param {Span} span - The span on which to record the error.
 * @param {unknown} e - The error thrown or passed to the callback/stream/promise.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @param {boolean} [includeExceptionMessage=false] - Whether to include `exception.message`
 *   on the `exception` event (true for low level network attempt spans, false for client request spans).
 * @returns {{rpcStatusName?: string; httpStatusCode?: number}} The resolved status codes.
 */
function recordSpanError(span, e, rpcType, includeExceptionMessage = false) {
    const rpcStatusName = rpcType === 'grpc' ? resolveRpcStatusName(e) : undefined;
    const httpStatusCode = rpcType === 'http' ? resolveHttpStatusCode(e) : undefined;
    const message = e instanceof Error ? e.message : resolveErrorMessage(e);
    span.setAttributes({
        'error.type': resolveErrorType(e, rpcType),
        'status.message': message,
    });
    if (e instanceof Error) {
        recordExceptionEvent(span, e, rpcType, includeExceptionMessage);
    }
    span.setStatus({ code: api_1.SpanStatusCode.ERROR, message });
    return { rpcStatusName, httpStatusCode };
}
/**
 * Creates `recordError`, `endSpan`, and `tracedCallback` handlers for a traced call or attempt.
 * Leaves span status unset on success per OpenTelemetry semantic conventions, and ends the span
 * before invoking the user callback so user callback errors are not attributed to the RPC.
 *
 * @param {SpanCompletionOptions} options - Span and transport options for the completion handlers.
 * @param {APICallback} [callback] - Optional user or attempt callback to wrap.
 * @returns {{recordError: (e: unknown) => void; endSpan: () => void; tracedCallback?: APICallback}}
 *   The error-recording, span-ending, and wrapped callback handlers.
 */
function createSpanCompletionHandlers(options, callback) {
    const { span, rpcType, rawAddress, rawPort, includeExceptionMessage } = options;
    let spanEnded = false;
    let errorRecorded = false;
    let recordedError;
    let rpcStatusName;
    let httpStatusCode;
    const recordError = (e) => {
        recordedError = e;
        errorRecorded = true;
        ({ rpcStatusName, httpStatusCode } = recordSpanError(span, e, rpcType, includeExceptionMessage));
    };
    const endSpan = () => {
        if (!spanEnded) {
            spanEnded = true;
            // Default to OK / 200 when no error was recorded.
            if (!errorRecorded) {
                rpcStatusName = status_1.Status[status_1.Status.OK];
                httpStatusCode = 200;
            }
            setFinalStatusAttributes(span, rpcType, rpcStatusName, httpStatusCode, rawAddress, rawPort, errorRecorded, recordedError);
            span.end();
        }
    };
    // End span before invoking user callback so callback errors are not recorded.
    const tracedCallback = callback
        ? function (...args) {
            const err = args[0];
            if (err) {
                recordError(err);
            }
            endSpan();
            callback.apply(this, args);
        }
        : undefined;
    return { recordError, endSpan, tracedCallback };
}
/**
 * Executes `fn` within `executionContext` and attaches stream, promise, callback,
 * or synchronous completion handlers to its result.
 *
 * @template T
 * @param {Context} executionContext - The OpenTelemetry context to activate during `fn` execution.
 * @param {function} fn - The operation to execute, receiving `tracedCallback` if `callback` was provided.
 * @param {boolean} isStreamCall - Whether the operation returns a stream (`EventEmitter`).
 * @param {SpanCompletionOptions} options - Span completion options.
 * @param {APICallback} [callback] - Optional callback to wrap for completion tracking.
 * @returns {T} The return value of `fn`.
 */
function executeTracedOperation(executionContext, fn, isStreamCall, options, callback) {
    const { recordError, endSpan, tracedCallback } = createSpanCompletionHandlers(options, callback);
    try {
        const result = api_1.context.with(executionContext, () => fn(tracedCallback));
        const promiseTarget = !isStreamCall ? getPromiseTarget(result) : null;
        if (isStreamCall && result instanceof events_1.EventEmitter) {
            handleStream(result, recordError, endSpan, !!tracedCallback);
        }
        else if (promiseTarget) {
            handlePromise(promiseTarget, recordError, endSpan);
        }
        else if (!tracedCallback) {
            endSpan();
        }
        return result;
    }
    catch (e) {
        recordError(e);
        endSpan();
        throw e;
    }
}
function traceCall(dynamicArgs, staticArgs, fn, isStreamCall = false, callback) {
    const spanName = `${dynamicArgs.clientName}.${dynamicArgs.methodName}`;
    return getGaxTracer().startActiveSpan(spanName, {}, (span) => {
        const { rawAddress, rawPort, urlDomain } = resolveEndpointAndDomain(dynamicArgs, staticArgs);
        span.setAttributes(buildInitialAttributes(dynamicArgs, staticArgs, urlDomain));
        const activeContext = api_1.context
            .active()
            .setValue(CLIENT_REQUEST_SPAN_KEY, span);
        return executeTracedOperation(activeContext, fn, isStreamCall, {
            span,
            rpcType: dynamicArgs.rpcType,
            rawAddress,
            rawPort,
        }, callback);
    });
}
/**
 * Executes an individual RPC transport attempt within an active OpenTelemetry
 * CLIENT span (low level network span), parenting it to the active client request span
 * and recording per-attempt client (`gcp.client.*`), network (`rpc.system.name`, `rpc.method`,
 * `http.request.method`, `url.template`, `url.domain`, `server.address`, `server.port`),
 * resend (`gcp.grpc.resend_count` / `http.request.resend_count`), status
 * (`rpc.response.status_code` / `http.response.status_code`), and error (`error.type`,
 * `status.message`, and `exception.type` / `exception.message` event attributes) attributes
 * without injecting span context into outgoing headers.
 *
 * HTTP attempt spans are named `"{http.request.method} {url.template}"` when a URL
 * template is available or `"{http.request.method}"` otherwise; gRPC attempt spans
 * are named `"{apiName}/{methodName}"` or `"{methodName}"`. Also updates `rpc.method`
 * on the parent client request span to `"{apiName}/{methodName}"` for both transports,
 * and propagates `url.template` to the parent client request span from its first HTTP
 * attempt that resolves a URL template.
 *
 * @template T
 * @param {AttemptTraceContext} dynamicArgs - Dynamic trace context for the RPC attempt.
 * @param {StaticTraceContext} staticArgs - Static trace context for the client library.
 * @param {function} fn - The transport attempt operation to trace.
 * @param {boolean} [isStreamCall=false] - Whether the operation is a stream call.
 * @param {APICallback} [callback] - The attempt callback.
 * @param {Context} [parentContext] - Optional parent OpenTelemetry context (e.g. client request span context).
 * @returns {T} The result of the traced attempt.
 */
function traceAttempt(dynamicArgs, staticArgs, fn, isStreamCall = false, callback, parentContext) {
    // Resolve RPC method and transport-specific span name.
    const rpcMethod = dynamicArgs.apiName
        ? `${dynamicArgs.apiName}/${dynamicArgs.methodName}`
        : dynamicArgs.methodName;
    const httpMethod = dynamicArgs.httpMethod ?? 'POST';
    const urlTemplate = dynamicArgs.urlTemplate;
    const spanName = dynamicArgs.rpcType === 'http'
        ? formatHttpAttemptSpanName(httpMethod, urlTemplate)
        : rpcMethod;
    const baseContext = parentContext ?? api_1.context.active();
    const clientRequestSpan = baseContext.getValue(CLIENT_REQUEST_SPAN_KEY);
    return getGaxTracer().startActiveSpan(spanName, { kind: api_1.SpanKind.CLIENT }, baseContext, (span) => {
        // Update parent client request span rpc.method from this child attempt.
        if (clientRequestSpan && rpcMethod) {
            clientRequestSpan.setAttribute('rpc.method', rpcMethod);
        }
        const { rawAddress, rawPort, urlDomain } = resolveEndpointAndDomain(dynamicArgs, staticArgs, 443);
        const initialAttributes = buildInitialAttributes(dynamicArgs, staticArgs, urlDomain);
        if (dynamicArgs.rpcType === 'grpc') {
            initialAttributes['rpc.method'] = rpcMethod;
        }
        else {
            initialAttributes['http.request.method'] = httpMethod;
            if (urlTemplate) {
                attemptUrlTemplates.set(span, urlTemplate);
                initialAttributes['url.template'] = urlTemplate;
                propagateUrlTemplateToClientSpan(clientRequestSpan, span, urlTemplate);
            }
        }
        if (dynamicArgs.resendCount !== undefined &&
            dynamicArgs.resendCount > 0) {
            initialAttributes[resolveResendCountAttribute(dynamicArgs.rpcType)] =
                dynamicArgs.resendCount;
        }
        span.setAttributes(initialAttributes);
        // Expose attempt span in context so HTTP transport can update method and URL template.
        const attemptContext = api_1.context.active().setValue(ATTEMPT_SPAN_KEY, span);
        return executeTracedOperation(attemptContext, fn, isStreamCall, {
            span,
            rpcType: dynamicArgs.rpcType,
            rawAddress,
            rawPort,
            includeExceptionMessage: true,
        }, callback);
    });
}
//# sourceMappingURL=TracerHelper.js.map