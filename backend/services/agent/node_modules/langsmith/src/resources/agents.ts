// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import {
  ItemsCursorGetPagination,
  type ItemsCursorGetPaginationParams,
  PagePromise,
} from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Agents extends APIResource {
  /**
   * Creates an Agent with a caller-assigned ID. Returns 409 if the ID already
   * exists. Creates all four environments unless production_only is set for a FLEET
   * agent. source_type defaults to EXTERNAL in this SDK. agent_type defaults to
   * CUSTOM. The authenticated user becomes the owner
   * when available. Requires permission to create projects. The response does not
   * include runtime bindings.
   */
  create(body: AgentCreateParams, options?: RequestOptions): APIPromise<Agent> {
    return this._client.post('/api/v1/agents', {
      body: { ...body, source_type: body.source_type === undefined ? 'EXTERNAL' : body.source_type },
      ...options,
    });
  }

  /**
   * Returns an Agent with the environments visible to the caller. The path value is
   * the user-assigned Agent ID. Pass include=runtime_bindings to embed each
   * environment's runtime bindings.
   */
  retrieve(
    agentID: string,
    query: AgentRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<Agent> {
    return this._client.get(path`/api/v1/agents/${agentID}`, { query, ...options });
  }

  /**
   * Updates an Agent's name, source_type, agent_type, or owner_id. Omitted fields
   * keep their values. Changing or clearing owner_id additionally requires
   * workspaces:manage; assigning an owner also requires workspaces:read and active
   * workspace membership. Fleet ownership cannot be changed through this endpoint.
   * Changing agent_type requires workspaces:manage in addition to project update
   * access; repeating the current type is a no-op. Source type can change only for
   * an EXTERNAL Agent without runtime bindings. The id is immutable and is rejected
   * when present. Requires update permission on every environment project.
   */
  update(agentID: string, body: AgentUpdateParams, options?: RequestOptions): APIPromise<Agent> {
    return this._client.patch(path`/api/v1/agents/${agentID}`, { body, ...options });
  }

  /**
   * Returns Agents visible to the caller. Each item is the same Agent shape as GET
   * /api/v1/agents/{agent_id}, including the environments the caller may read. The
   * list never embeds runtime bindings. An unknown query parameter, including limit,
   * returns 400; use page_size to set the page size.
   */
  list(
    query: AgentListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<AgentsItemsCursorGetPagination, Agent> {
    return this._client.getAPIList('/api/v1/agents', ItemsCursorGetPagination<Agent>, { query, ...options });
  }

  /**
   * Permanently deletes an Agent, along with its environments, runtime bindings,
   * runtimes, and tracing projects. This cannot be undone. Deleting an Agent that
   * does not exist returns 204.
   */
  delete(agentID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/api/v1/agents/${agentID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type AgentsItemsCursorGetPagination = ItemsCursorGetPagination<Agent>;

export interface Agent {
  id: string;

  agent_type: 'CUSTOM' | 'CODING';

  created_at: string;

  environments: Array<Agent.Environment>;

  name: string;

  source_type: 'LSD' | 'MDA' | 'EXTERNAL' | 'FLEET';

  /**
   * Owner is the owner's full name, falling back to email when available.
   */
  owner?: string;

  owner_id?: string | null;

  tag_key_id?: string | null;

  tag_value_id?: string | null;
}

export namespace Agent {
  export interface Environment {
    id: string;

    agent_id: string;

    environment: 'LOCAL' | 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

    tracer_session_id: string;

    tracer_session_name: string;

    runtime_bindings?: Array<Environment.RuntimeBinding>;
  }

  export namespace Environment {
    export interface RuntimeBinding {
      id: string;

      agent_environment_id: string;

      source_id: string;
    }
  }
}

export interface AgentCreateParams {
  /**
   * Unique agent identifier: 1-63 lowercase letters, digits, or hyphens, starting
   * with a letter and ending with a letter or digit.
   */
  id: string;

  /**
   * Agent runtime kind. Defaults to EXTERNAL for an application hosted outside
   * LangSmith when omitted.
   */
  source_type?: 'LSD' | 'MDA' | 'EXTERNAL' | 'FLEET';

  /**
   * AgentType defaults to CUSTOM when omitted.
   */
  agent_type?: 'CUSTOM' | 'CODING';

  /**
   * Display name. Defaults to the agent ID.
   */
  name?: string;

  /**
   * ProductionOnly creates only the PRODUCTION environment. It is accepted only when
   * SourceType is FLEET; other sources always get all four environments.
   */
  production_only?: boolean;
}

export interface AgentRetrieveParams {
  /**
   * Relation to embed. runtime_bindings adds each environment's runtime bindings; an
   * empty array means no runtime is linked.
   */
  include?: 'runtime_bindings';
}

export interface AgentUpdateParams {
  /**
   * New classification. Omit to keep the current classification.
   */
  agent_type?: 'CUSTOM' | 'CODING';

  /**
   * New display name. Omit to keep the current name.
   */
  name?: string;

  /**
   * Omit to leave the owner unchanged; null clears it.
   */
  owner_id?: string | null;

  /**
   * New runtime kind. Only EXTERNAL agents without runtime bindings can change kind.
   */
  source_type?: 'LSD' | 'MDA' | 'EXTERNAL' | 'FLEET';
}

export interface AgentListParams extends ItemsCursorGetPaginationParams {
  /**
   * Exact Agent ids (repeat the parameter; maximum 100)
   */
  id?: Array<string>;

  /**
   * Case-insensitive partial Agent name
   */
  name?: string;

  /**
   * Field to sort by. When name is set, exact name matches still come first.
   */
  sort_by?: 'last_run_start_time' | 'name' | 'created_at';

  /**
   * Sort direction
   */
  sort_order?: 'asc' | 'desc';

  /**
   * Agent source type
   */
  source_type?: 'LSD' | 'MDA' | 'EXTERNAL' | 'FLEET';
}

export declare namespace Agents {
  export {
    type Agent as Agent,
    type AgentsItemsCursorGetPagination as AgentsItemsCursorGetPagination,
    type AgentCreateParams as AgentCreateParams,
    type AgentRetrieveParams as AgentRetrieveParams,
    type AgentUpdateParams as AgentUpdateParams,
    type AgentListParams as AgentListParams,
  };
}
