// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Registries extends APIResource {
  /**
   * Create a sandbox registry for pulling private images.
   */
  create(body: RegistryCreateParams, options?: RequestOptions): APIPromise<RegistryResponse> {
    return this._client.post('/api/v2/sandboxes/registries', { body, ...options });
  }

  /**
   * Get a sandbox registry by name.
   */
  retrieve(name: string, options?: RequestOptions): APIPromise<RegistryResponse> {
    return this._client.get(path`/api/v2/sandboxes/registries/${name}`, options);
  }

  /**
   * Update a sandbox registry's name and/or credentials.
   */
  update(name: string, body: RegistryUpdateParams, options?: RequestOptions): APIPromise<RegistryResponse> {
    return this._client.patch(path`/api/v2/sandboxes/registries/${name}`, { body, ...options });
  }

  /**
   * List sandbox registries for pulling private images. Page with page_size and
   * cursor, replaying next_cursor until it is null. Results are ordered newest
   * first, with stable ordering for equal creation times. Keep filters unchanged
   * between pages. Requests without page_size or cursor retain the legacy default of
   * 50 results. Cursor requests default to 20 results, with a maximum of 100.
   */
  list(
    query: RegistryListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<RegistryListResponse> {
    return this._client.get('/api/v2/sandboxes/registries', { query, ...options });
  }

  /**
   * Delete a sandbox registry by name.
   */
  delete(name: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/api/v2/sandboxes/registries/${name}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface RegistryListResponse {
  items?: Array<RegistryResponse>;

  next_cursor?: string | null;

  /**
   * Deprecated: only applies to limit/offset requests. Use next_cursor when paging
   * with a cursor.
   */
  offset?: number;

  /**
   * Deprecated: use items.
   */
  registries?: Array<RegistryResponse>;
}

export interface RegistryResponse {
  id?: string;

  auth_type?: 'DOCKER_CONFIG' | 'AWS_ROLE';

  aws_role_arn?: string;

  created_at?: string;

  created_by?: string;

  name?: string;

  provider?: 'DOCKER_REGISTRY' | 'HARBOR' | 'GHCR' | 'ECR' | 'GAR' | 'DOCKER_HUB';

  repository_search_mode?: 'GLOBAL' | 'SCOPED' | 'NONE';

  updated_at?: string;

  updated_by?: string;

  url?: string;
}

export interface RegistryCreateParams {
  name: string;

  url: string;

  auth_type?: 'DOCKER_CONFIG' | 'AWS_ROLE';

  aws_role_arn?: string;

  password?: string;

  username?: string;
}

export interface RegistryUpdateParams {
  auth_type?: 'DOCKER_CONFIG' | 'AWS_ROLE';

  aws_role_arn?: string;

  name?: string;

  password?: string;

  url?: string;

  username?: string;
}

export interface RegistryListParams {
  /**
   * Opaque cursor from a prior response's next_cursor
   */
  cursor?: string;

  /**
   * Deprecated: use page_size. Maximum number of registries to return
   */
  limit?: number;

  /**
   * Filter to registries whose name contains this substring
   */
  name_contains?: string;

  /**
   * Deprecated: use cursor. Number of registries to skip
   */
  offset?: number;

  /**
   * Number of results per cursor page
   */
  page_size?: number;
}

export declare namespace Registries {
  export {
    type RegistryListResponse as RegistryListResponse,
    type RegistryResponse as RegistryResponse,
    type RegistryCreateParams as RegistryCreateParams,
    type RegistryUpdateParams as RegistryUpdateParams,
    type RegistryListParams as RegistryListParams,
  };
}
