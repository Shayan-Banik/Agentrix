// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SandboxesAPI from './sandboxes';
import { SandboxResponsesItemsCursorGetPagination } from './sandboxes';
import { APIPromise } from '../../core/api-promise';
import {
  ItemsCursorGetPagination,
  type ItemsCursorGetPaginationParams,
  PagePromise,
} from '../../core/pagination';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Boxes extends APIResource {
  /**
   * Create a new sandbox from a snapshot. Provide at most one of `snapshot_id` or
   * `snapshot_name`; if neither is provided, the server uses the default snapshot.
   * `snapshot_name` accepts a Docker-style `name` or `name:tag` reference (a bare
   * name resolves to `name:latest`).
   */
  create(body: BoxCreateParams, options?: RequestOptions): APIPromise<SandboxesAPI.SandboxResponse> {
    return this._client.post('/api/v2/sandboxes/boxes', { body, ...options });
  }

  /**
   * Retrieve a sandbox by name. Stale provisioning sandboxes are auto-failed.
   */
  retrieve(name: string, options?: RequestOptions): APIPromise<SandboxesAPI.SandboxResponse> {
    return this._client.get(path`/api/v2/sandboxes/boxes/${name}`, options);
  }

  /**
   * Update a sandbox's display name, retention, resources, tags, or proxy
   * configuration. The name must be unique within the tenant. Proxy configuration
   * sent to a sandbox that is not running is stored and applied when it next starts.
   */
  update(
    name: string,
    body: BoxUpdateParams,
    options?: RequestOptions,
  ): APIPromise<SandboxesAPI.SandboxResponse> {
    return this._client.patch(path`/api/v2/sandboxes/boxes/${name}`, { body, ...options });
  }

  /**
   * List sandboxes for the authenticated tenant, with optional filtering, sorting,
   * and pagination. Page with page_size and cursor: replay the response's
   * next_cursor until it comes back null, which is the only signal that no pages
   * remain. Cursors are opaque and only valid on this endpoint; do not parse or
   * construct one.
   */
  list(
    query: BoxListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<SandboxResponsesItemsCursorGetPagination, SandboxesAPI.SandboxResponse> {
    return this._client.getAPIList(
      '/api/v2/sandboxes/boxes',
      ItemsCursorGetPagination<SandboxesAPI.SandboxResponse>,
      { query, ...options },
    );
  }

  /**
   * Delete a sandbox by name or UUID. Tears down the sandbox runtime and removes the
   * DB record.
   */
  delete(name: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/api/v2/sandboxes/boxes/${name}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Create a snapshot by capturing the current state of a sandbox or promoting an
   * existing checkpoint.
   */
  createSnapshot(
    name: string,
    body: BoxCreateSnapshotParams,
    options?: RequestOptions,
  ): APIPromise<SandboxesAPI.SnapshotResponse> {
    return this._client.post(path`/api/v2/sandboxes/boxes/${name}/snapshot`, { body, ...options });
  }

  /**
   * Removes the sharing grant for one port, or for every port when port is omitted.
   * A LangSmith login URL stops working immediately. A previously minted service
   * token is not revoked and stays valid until it expires, but no new one can be
   * issued from the removed grant.
   */
  deleteServiceURL(
    name: string,
    params: BoxDeleteServiceURLParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    const { port } = params ?? {};
    return this._client.delete(path`/api/v2/sandboxes/boxes/${name}/service-urls`, {
      query: { port },
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Generate a tokenized link that downloads a single file from a sandbox with no
   * further authentication. This mints a token rather than creating an addressable
   * resource, so it returns 200 with no Location header. The token pins the sandbox,
   * the file path, the response content type and disposition, and the sandbox flags,
   * so a link cannot be repointed at another file or served under a weaker policy.
   * The file is always served with a Content-Security-Policy: a sandbox directive,
   * plus a default-src holding every fetch to the file's own download host and a set
   * of pre-approved third-party origins. csp_sandbox_flags may loosen the sandbox
   * with allow-downloads, allow-forms, allow-modals, allow-orientation-lock,
   * allow-pointer-lock, allow-popups, allow-presentation, allow-same-origin,
   * allow-scripts, or allow-top-navigation-by-user-activation. Every file is served
   * from its own host, derived from the sandbox and the path, so allow-same-origin
   * gives a page localStorage and IndexedDB that no other file can read, and
   * re-minting a link for the same file keeps them. csp_sandbox set to false drops
   * the sandbox directive altogether, and csp_sandbox_flags must then be omitted.
   * csp_source_bundles selects the third-party origins: cdnjs, google-fonts,
   * jsdelivr, and unpkg are all allowed when the field is omitted, 'none' holds the
   * file to its own host, and 'any' sends no default-src at all. Links never expire
   * unless expires_in_seconds is set. The link is served from the sandbox service
   * domain, not the API host.
   */
  generateDownloadURL(
    name: string,
    body: BoxGenerateDownloadURLParams,
    options?: RequestOptions,
  ): APIPromise<SandboxesAPI.DownloadURLResponse> {
    return this._client.post(path`/api/v2/sandboxes/boxes/${name}/download-url`, { body, ...options });
  }

  /**
   * Create a short-lived JWT for accessing an HTTP service running on a specific
   * port inside a sandbox. Returns a browser_url (sets auth cookie via redirect), a
   * service_url (for use with the X-Langsmith-Sandbox-Service-Token header), the raw
   * token, and its expiry. Set access=restricted|workspace to instead enable durable
   * LangSmith login (no token; users authenticate with their normal LangSmith
   * session), or access=off to disable it. With LangSmith login, embed_origins names
   * the pages that may show the URL in an iframe; a viewer signs in from inside the
   * frame through a LangSmith popup. LangSmith login and token access are mutually
   * exclusive per service URL.
   */
  generateServiceURL(
    name: string,
    body: BoxGenerateServiceURLParams,
    options?: RequestOptions,
  ): APIPromise<SandboxesAPI.ServiceURLResponse> {
    return this._client.post(path`/api/v2/sandboxes/boxes/${name}/service-url`, { body, ...options });
  }

  /**
   * Retrieve the lightweight status of a sandbox for polling.
   */
  getStatus(name: string, options?: RequestOptions): APIPromise<SandboxesAPI.SandboxStatusResponse> {
    return this._client.get(path`/api/v2/sandboxes/boxes/${name}/status`, options);
  }

  /**
   * Returns one entry per port the sandbox is currently reachable on, so a caller
   * can see what is shared before turning it off. Expired token grants are omitted.
   * Cursors are opaque and only valid on this endpoint; do not parse or construct
   * one.
   */
  listServiceURLs(
    name: string,
    query: BoxListServiceURLsParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<BoxListServiceURLsResponsesItemsCursorGetPagination, BoxListServiceURLsResponse> {
    return this._client.getAPIList(
      path`/api/v2/sandboxes/boxes/${name}/service-urls`,
      ItemsCursorGetPagination<BoxListServiceURLsResponse>,
      { query, ...options },
    );
  }

  /**
   * Start a stopped or failed sandbox. This endpoint is not idempotent.
   */
  start(name: string, options?: RequestOptions): APIPromise<SandboxesAPI.SandboxResponse> {
    return this._client.post(path`/api/v2/sandboxes/boxes/${name}/start`, options);
  }

  /**
   * Stop a ready sandbox. This endpoint is not idempotent; the filesystem is
   * preserved for later restart.
   */
  stop(name: string, options?: RequestOptions): APIPromise<void> {
    return this._client.post(path`/api/v2/sandboxes/boxes/${name}/stop`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type BoxListServiceURLsResponsesItemsCursorGetPagination =
  ItemsCursorGetPagination<BoxListServiceURLsResponse>;

export interface BoxListServiceURLsResponse {
  /**
   * How the port is shared: "token" for a minted service token, or
   * "restricted"/"workspace" for LangSmith login.
   */
  access: 'token' | 'restricted' | 'workspace';

  created_at: string;

  port: number;

  /**
   * The LangSmith user who first shared this port, when known.
   */
  created_by?: string;

  /**
   * Origins that may embed a LangSmith login URL in an iframe; omitted when there
   * are none.
   */
  embed_origins?: Array<string>;

  /**
   * When the share expires. Set only for "token"; a login grant does not expire.
   */
  expires_at?: string;
}

export interface BoxCreateParams {
  /**
   * AccessDelegation lets code inside the sandbox call the LangSmith API as you,
   * with at most the permissions granted here. Omit for no access.
   */
  access_delegation?: BoxCreateParams.AccessDelegation;

  /**
   * CPUMillicores optionally requests CPU at millicore granularity (e.g. 500 = 0.5
   * vCPU); takes precedence over VCPUs. Fractional (sub-vCPU) values are not
   * available for every sandbox.
   */
  cpu_millicores?: number;

  delete_after_stop_seconds?: number;

  env_vars?: { [key: string]: string };

  fs_capacity_bytes?: number;

  idle_ttl_seconds?: number;

  /**
   * Labels are free-form key/value metadata persisted with the sandbox and returned
   * on reads. Labels from the source snapshot are inherited unless overridden here.
   */
  labels?: { [key: string]: string };

  /**
   * Memory for the sandbox, in bytes. Memory is tied to CPU at 4 GiB per vCPU: omit
   * it and it follows that ratio; set it and it must stay within 50% of the ratio
   * for the requested CPU, so a 1 vCPU sandbox accepts 2-6 GiB. Setting memory
   * without CPU derives the CPU from the same ratio. Maximum 64 GiB.
   */
  mem_bytes?: number;

  mount_config?: SandboxesAPI.SandboxMountConfig;

  name?: string;

  /**
   * PreserveMemoryOnStop, when true, suspends the sandbox's memory on a voluntary
   * stop (idle timeout or explicit stop) so the next start resumes from where it
   * left off. Default false discards memory and keeps only the filesystem, so the
   * next start is a cold boot. Restarts triggered by infrastructure maintenance
   * always preserve memory regardless of this setting.
   */
  preserve_memory_on_stop?: boolean;

  proxy_config?: SandboxesAPI.ProxyConfig;

  /**
   * RestoreMemory selects how the sandbox handles a snapshot's captured memory:
   *
   * nil → if-present: resume from memory when the snapshot has it, else cold-boot
   * (default). true → always: resume from memory; rejected if the snapshot has none.
   * false → never: always cold-boot.
   *
   * Applies to this request only.
   */
  restore_memory?: boolean;

  /**
   * RunConfig overrides the snapshot's run config for this sandbox: user and
   * work_dir replace the snapshot's, env_vars merge over it. The result is what the
   * sandbox boots with, and what a snapshot captured from it carries.
   */
  run_config?: BoxCreateParams.RunConfig;

  /**
   * Snapshot is a Docker-style name or name:tag reference to boot from. A bare name
   * resolves to name:latest.
   */
  snapshot?: string;

  snapshot_id?: string;

  /**
   * SnapshotName is a synonym for Snapshot, accepted for compatibility with clients
   * that predate it. Set one or the other.
   */
  snapshot_name?: string;

  tag_value_ids?: Array<string>;

  vcpus?: number;
}

export namespace BoxCreateParams {
  /**
   * AccessDelegation lets code inside the sandbox call the LangSmith API as you,
   * with at most the permissions granted here. Omit for no access.
   */
  export interface AccessDelegation {
    mode: 'INHERIT' | 'EXPLICIT';

    permissions?: Array<string>;
  }

  /**
   * RunConfig overrides the snapshot's run config for this sandbox: user and
   * work_dir replace the snapshot's, env_vars merge over it. The result is what the
   * sandbox boots with, and what a snapshot captured from it carries.
   */
  export interface RunConfig {
    env_vars?: { [key: string]: string };

    user?: string;

    work_dir?: string;
  }
}

export interface BoxUpdateParams {
  cpu_millicores?: number;

  delete_after_stop_seconds?: number;

  fs_capacity_bytes?: number;

  idle_ttl_seconds?: number;

  /**
   * New memory for the sandbox, in bytes. The 4 GiB per vCPU ratio applies when the
   * sandbox is created; a resize enforces only the maximum of 64 GiB.
   */
  mem_bytes?: number;

  name?: string;

  proxy_config?: SandboxesAPI.ProxyConfig;

  /**
   * RunConfig changes what subsequent commands run with: user and work_dir replace
   * the current values, env_vars merge over them. Commands already running are
   * unaffected.
   */
  run_config?: BoxUpdateParams.RunConfig;

  tag_value_ids?: Array<string>;

  vcpus?: number;
}

export namespace BoxUpdateParams {
  /**
   * RunConfig changes what subsequent commands run with: user and work_dir replace
   * the current values, env_vars merge over them. Commands already running are
   * unaffected.
   */
  export interface RunConfig {
    env_vars?: { [key: string]: string };

    user?: string;

    work_dir?: string;
  }
}

export interface BoxListParams extends ItemsCursorGetPaginationParams {
  /**
   * Filter by creator identity. Only 'me' is supported.
   */
  created_by?: string;

  /**
   * Filter by label. Repeatable; all must match. Use 'key' to match on key presence
   * or 'key=value' for equality.
   */
  label?: Array<string>;

  /**
   * Deprecated: use page_size. Maximum number of results
   */
  limit?: number;

  /**
   * Filter by name substring
   */
  name_contains?: string;

  /**
   * Deprecated: use cursor. Pagination offset
   */
  offset?: number;

  /**
   * Sort column (name, status, created_at, stopped_at, idle_ttl_seconds,
   * delete_after_stop_seconds)
   */
  sort_by?: string;

  /**
   * Deprecated: use sort_order. Sort direction (asc, desc)
   */
  sort_direction?: string;

  /**
   * Sort direction (asc, desc)
   */
  sort_order?: string;

  /**
   * Filter by status (provisioning, ready, failed, stopped, deleting)
   */
  status?: string;

  /**
   * Filter by workspace resource tag value IDs; all must match
   */
  tag_value_id?: Array<string>;
}

export interface BoxCreateSnapshotParams {
  name: string;

  /**
   * if omitted, creates a fresh checkpoint from the running VM
   */
  checkpoint?: string;

  /**
   * Must be true when the included settings hold literal secret values (opaque
   * values rather than workspace secret references, and any env var value),
   * acknowledging that the snapshot stores them and every sandbox created from it
   * can use them.
   */
  confirm_allow_snapshot_secret_values?: boolean;

  /**
   * Description says what this snapshot's image can do, so a caller can hand it to
   * an agent as a capability summary. At most 1024 characters.
   */
  description?: string;

  /**
   * sandbox-local Docker image to export
   */
  docker_image?: string;

  /**
   * required for Docker image export unless the sandbox has a capacity
   */
  fs_capacity_bytes?: number;

  /**
   * Sandbox settings to carry into the snapshot. Sandboxes created from it start
   * with each carried setting their create request leaves unset: "mounts" (the
   * mount_config, with its auth), "proxy_config", "env_vars", "resources" (CPU and
   * memory), "lifecycle" (idle_ttl_seconds, delete_after_stop_seconds,
   * preserve_memory_on_stop), and "labels" (merged under this request's labels;
   * reserved com.langchain.\* labels are left out). "all" names every one of these.
   * VM memory is captured with include_memory, not here. Warning: mounts,
   * proxy_config and env_vars carry the sandbox's credentials, and every sandbox
   * created from the snapshot can use them.
   */
  include?: Array<'all' | 'mounts' | 'proxy_config' | 'env_vars' | 'resources' | 'lifecycle' | 'labels'>;

  /**
   * IncludeMemory, when true, captures a full VM memory snapshot alongside the
   * filesystem clone. Only honored when the sandbox is running AND Checkpoint is
   * omitted (i.e. a fresh in-VM checkpoint is requested). Defaults to false to keep
   * snapshots small unless memory restore is explicitly desired.
   */
  include_memory?: boolean;

  /**
   * Labels seed the captured snapshot's labels.
   */
  labels?: { [key: string]: string };

  /**
   * RunConfig overrides the runtime configuration the snapshot carries: for a
   * docker_image export, the image's USER, WORKDIR and ENV; for a capture of the
   * running VM, the sandbox's own. user and work_dir replace, env_vars merge.
   */
  run_config?: BoxCreateSnapshotParams.RunConfig;

  /**
   * mutable Docker-style tag; defaults to "latest"
   */
  tag?: string;
}

export namespace BoxCreateSnapshotParams {
  /**
   * RunConfig overrides the runtime configuration the snapshot carries: for a
   * docker_image export, the image's USER, WORKDIR and ENV; for a capture of the
   * running VM, the sandbox's own. user and work_dir replace, env_vars merge.
   */
  export interface RunConfig {
    env_vars?: { [key: string]: string };

    user?: string;

    work_dir?: string;
  }
}

export interface BoxDeleteServiceURLParams {
  /**
   * Port to stop sharing. Omit to stop sharing every port.
   */
  port?: number;
}

export interface BoxGenerateDownloadURLParams {
  path: string;

  content_disposition?: string;

  content_type?: string;

  /**
   * CSPSandbox false serves the file with no CSP sandbox directive; omit to keep it.
   */
  csp_sandbox?: boolean;

  /**
   * CSPSandboxFlags loosen the CSP sandbox the file is served under; omit for the
   * most restrictive policy.
   */
  csp_sandbox_flags?: Array<
    | 'allow-downloads'
    | 'allow-forms'
    | 'allow-modals'
    | 'allow-orientation-lock'
    | 'allow-pointer-lock'
    | 'allow-popups'
    | 'allow-presentation'
    | 'allow-scripts'
    | 'allow-top-navigation-by-user-activation'
    | 'allow-same-origin'
  >;

  /**
   * CSPSourceBundles allow the served file to fetch from named third-party origins;
   * omit to send no fetch directive.
   */
  csp_source_bundles?: Array<'cdnjs' | 'google-fonts' | 'jsdelivr' | 'unpkg' | 'none' | 'any'>;

  /**
   * ExpiresInSeconds is optional; a link with no expiry never expires.
   */
  expires_in_seconds?: number;
}

export interface BoxGenerateServiceURLParams {
  /**
   * Access selects the login mode, mutually exclusive with the minted token. Omit
   * the field for token mode: mint a short-lived service token (default).
   * "restricted" — LangSmith login: the sandbox's creator, or any user with
   * SandboxesExec on it (admins by default). "workspace" — LangSmith login: any
   * member of the owning workspace. "off" — remove an existing LangSmith login grant
   * and mint a token. A LangSmith login grant is durable; token mode is refused
   * (409) while one exists.
   */
  access?: 'restricted' | 'workspace' | 'off';

  /**
   * EmbedOrigins are the pages allowed to show a LangSmith login service URL in an
   * iframe, besides LangSmith itself: at most 5 origins such as
   * https://app.example.com (http only for localhost). Valid only with access
   * "restricted" or "workspace". Each call sets the URL's whole list, so omitting
   * the field removes any origins set before.
   */
  embed_origins?: Array<string>;

  expires_in_seconds?: number;

  port?: number;
}

export interface BoxListServiceURLsParams extends ItemsCursorGetPaginationParams {}

export declare namespace Boxes {
  export {
    type BoxListServiceURLsResponse as BoxListServiceURLsResponse,
    type BoxListServiceURLsResponsesItemsCursorGetPagination as BoxListServiceURLsResponsesItemsCursorGetPagination,
    type BoxCreateParams as BoxCreateParams,
    type BoxUpdateParams as BoxUpdateParams,
    type BoxListParams as BoxListParams,
    type BoxCreateSnapshotParams as BoxCreateSnapshotParams,
    type BoxDeleteServiceURLParams as BoxDeleteServiceURLParams,
    type BoxGenerateDownloadURLParams as BoxGenerateDownloadURLParams,
    type BoxGenerateServiceURLParams as BoxGenerateServiceURLParams,
    type BoxListServiceURLsParams as BoxListServiceURLsParams,
  };
}

export { type SandboxResponsesItemsCursorGetPagination };
