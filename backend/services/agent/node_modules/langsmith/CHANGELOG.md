# Changelog

## [0.11.1](https://github.com/langchain-ai/langsmith-javascript/compare/v0.11.0...v0.11.1) (2026-10-23)


### Features

* add agent owner API support ([114ccc9](https://github.com/langchain-ai/langsmith-javascript/commit/114ccc9a71df437bffe57be7d946bc8f54715b0b))
* **agents:** add agent registry CRUD to SDKs and CLI ([6dcf245](https://github.com/langchain-ai/langsmith-javascript/commit/6dcf245b865ffe1e9aed5c92f71309df11b56b47))
* **cli:** expose runs share and get-url to the CLI ([a49befa](https://github.com/langchain-ai/langsmith-javascript/commit/a49befae0d11bb6a686c4167b51156c7efbee8b2))
* **code-eval-v2:** allow trajectory on code_evaluator_input storage ([373193d](https://github.com/langchain-ai/langsmith-javascript/commit/373193d1c9848574495a85dbc17b2244e45d2411))
* **engine:** scan and fix GitLab projects through a workspace service account ([2f19a24](https://github.com/langchain-ai/langsmith-javascript/commit/2f19a24a72c6e07d5d2f2a64a0a09fe497b27c27))
* **evaluators:** add a decision evaluator type ([98795f0](https://github.com/langchain-ai/langsmith-javascript/commit/98795f0b354fd20a2e3e0f25057a2756530ad1b4))
* **evaluators:** workspace_secrets_keys on code evaluator CRUD ([2f6c792](https://github.com/langchain-ai/langsmith-javascript/commit/2f6c792f4ab5a5758b1c2a6f37250ac6fd68f85b))
* **js-sdk:** batch createFeedback through the multipart endpoint ([7ec472a](https://github.com/langchain-ai/langsmith-javascript/commit/7ec472a216b2d1070a408624c60ea9b750e20427))
* **runs:** add feedback modified_at window to /v2/traces/query ([a214626](https://github.com/langchain-ai/langsmith-javascript/commit/a214626d2b2ee571e692e2dded4ae4c670d149a9))
* **sandboxes:** carry sandbox settings into snapshots with include ([20de753](https://github.com/langchain-ai/langsmith-javascript/commit/20de7538a19cd48143e5b1f44d19b75ccb2beac4))
* **sandboxes:** let LangSmith login service URLs be embedded by named origins ([b32d596](https://github.com/langchain-ai/langsmith-javascript/commit/b32d5963b1e5aa81706ed58658fe23d4a9fc748c))
* **sdk-js:** create and list enforced feedback configs ([990cd41](https://github.com/langchain-ai/langsmith-javascript/commit/990cd41502fff5f72b62d513c7ab0894cbf6011a))
* **sdk:** add select and excludeDefaultFields to listExamples in the JS SDK ([6e06ed6](https://github.com/langchain-ai/langsmith-javascript/commit/6e06ed671c3a04cae749edb1457ee4027505a130))
* **sdk:** expose prompt webhooks in the SDKs and the langsmith CLI ([d170f31](https://github.com/langchain-ai/langsmith-javascript/commit/d170f31bdc6abd6493b95a4d1e751d09f1e2256f))
* **sdk:** expose prompt webhooks in the SDKs and the langsmith CLI ([ae865f6](https://github.com/langchain-ai/langsmith-javascript/commit/ae865f6ba211b149985dded367ae113f67e53e94))


### Bug Fixes

* **deps:** remediate open Dependabot advisories ([73c7167](https://github.com/langchain-ai/langsmith-javascript/commit/73c71677b14874b4188142dc8b04decc9172c85d))
* **sandboxes:** add cursor pagination to registry listing ([a0042b6](https://github.com/langchain-ai/langsmith-javascript/commit/a0042b6be05ae09ddbfef5c57bd8deaf7d9c26fb))
* **sdk:** default JavaScript agent creation to EXTERNAL ([3e652c9](https://github.com/langchain-ai/langsmith-javascript/commit/3e652c986b86922caf3a8f2f80234a4febeba072))
* **sdk:** keep wrap_openai Responses stream output when it ends incomplete or failed ([7faf71c](https://github.com/langchain-ai/langsmith-javascript/commit/7faf71ce6f719186529474c6a54f395420f21f81))
* support Standard Units in sandbox cost breakdowns ([3a7b3b4](https://github.com/langchain-ai/langsmith-javascript/commit/3a7b3b4b9ba8347b99af69812374e07ca2f7a428))
* update reference outputs ([bb02776](https://github.com/langchain-ai/langsmith-javascript/commit/bb0277648117ff5397625c6385c9473abd0d4846))


### Chores

* remove langsmith-sdk and staging repo leftovers, update SDK docs ([422242b](https://github.com/langchain-ai/langsmith-javascript/commit/422242bb9691aaa620af4447597b9145cf4bf387))
* **sdks:** stop committing generated .stats.yml ([950fbd9](https://github.com/langchain-ai/langsmith-javascript/commit/950fbd91624f5b0bfdb4e0bb33ec635399092d5a))


### Documentation

* point SDK agents at the monorepo JavaScript source ([9028f69](https://github.com/langchain-ai/langsmith-javascript/commit/9028f692768b466527e80f53ac55dbc7b26f8d47))


### Build System

* bump JavaScript SDK dependencies for security fixes ([75a71a7](https://github.com/langchain-ai/langsmith-javascript/commit/75a71a78d527430bd36e297dbfe630c6e22a610d))
* **sdks:** share sandbox mount and proxy config models ([7069372](https://github.com/langchain-ai/langsmith-javascript/commit/70693722064453667fb897bcdf5d9f0f7301ea89))

## [0.11.0](https://github.com/langchain-ai/langsmith-javascript/compare/v0.10.13...v0.11.0) (2026-10-15)


### ⚠ BREAKING CHANGES

* **sandboxes:** split ProxyGCPConfig into workload-identity and service-account variants

### Features

* **configs:** add deletion/enforcement fields and include_all_configs ([7df1ae2](https://github.com/langchain-ai/langsmith-javascript/commit/7df1ae2ca07fa57fcfd0c125fbeacd891ca551ae))
* **evaluators:** add agent_id filter to evaluator spend endpoint ([be176ba](https://github.com/langchain-ai/langsmith-javascript/commit/be176baae685f137b123151de63a2f776f4eb3bb))
* **otel:** send OTLP traces to an Agent environment ([#41](https://github.com/langchain-ai/langsmith-javascript/issues/41)) ([6887a9e](https://github.com/langchain-ai/langsmith-javascript/commit/6887a9efd53bcf7133064946057d053e22d0371e))
* **runs:** add min/max feedback_modified_at filter fields ([bbc9667](https://github.com/langchain-ai/langsmith-javascript/commit/bbc96674b2ee38741b5cadd8002aa571d9e70534))
* **sandboxes:** add Azure Blob mount and Azure proxy auth config support ([457d282](https://github.com/langchain-ai/langsmith-javascript/commit/457d282f6bea6532e1ec5ac0f40671af6826c5ce))
* **sandboxes:** add subject_scope and workload identity fields to AWS and GCP configs ([a5bfcf3](https://github.com/langchain-ai/langsmith-javascript/commit/a5bfcf34b749be2adcc2da2b98124e8deaa8ff49))
* **sandboxes:** split ProxyGCPConfig into workload-identity and service-account variants ([107e756](https://github.com/langchain-ai/langsmith-javascript/commit/107e756766be4c43af75fd883d8a3e47f84e07f5))


### Bug Fixes

* isolate concurrent comparative evaluator run order ([#48](https://github.com/langchain-ai/langsmith-javascript/issues/48)) ([8377ecd](https://github.com/langchain-ai/langsmith-javascript/commit/8377ecdf9038be82365b67bffb03a8065cc04fef))
* preserve NullableHeaders in public declarations ([#50](https://github.com/langchain-ai/langsmith-javascript/issues/50)) ([294751e](https://github.com/langchain-ai/langsmith-javascript/commit/294751e17b0884e7509d893fc54145a3612eb489))

## [0.10.13](https://github.com/langchain-ai/langsmith-javascript/compare/v0.10.12...v0.10.13) (2026-10-13)


### Bug Fixes

* cover all brace-expansion security patch lines ([#45](https://github.com/langchain-ai/langsmith-javascript/issues/45)) ([2c36f4e](https://github.com/langchain-ai/langsmith-javascript/commit/2c36f4e3ecbefc84632cb1a1fd7947a97cce36eb))
* **sdk:** merge AddressApi with Address to ensure easier serialization ([#47](https://github.com/langchain-ai/langsmith-javascript/issues/47)) ([7a46bea](https://github.com/langchain-ai/langsmith-javascript/commit/7a46bea0378aecbe01249a156e12477027897b9a))

## [0.10.12](https://github.com/langchain-ai/langsmith-javascript/compare/v0.10.11...v0.10.12) (2026-10-13)


### Features

* **runs:** add ai_search field and SSE streaming to query endpoints ([da3a95b](https://github.com/langchain-ai/langsmith-javascript/commit/da3a95bae3be74e8fe7af80ec84bfb1f893391e8))
* **sandbox:** accept any JOSE asymmetric algorithm chosen by the JWKS key ([#46](https://github.com/langchain-ai/langsmith-javascript/issues/46)) ([988b7d1](https://github.com/langchain-ai/langsmith-javascript/commit/988b7d1366200930621092198919dad69e157bd9))
* **sandboxes:** add encryption spec and cache/encryption mount variants ([6047b3c](https://github.com/langchain-ai/langsmith-javascript/commit/6047b3c2500b0291a8bb6b8492a15a243198790c))
* **webhooks:** add test_webhook_destination endpoint ([a5c70fd](https://github.com/langchain-ai/langsmith-javascript/commit/a5c70fdb5fac90901a20b2a45a5dc1c43ec71ca9))


### Bug Fixes

* bump vulnerable transitive dependencies ([#43](https://github.com/langchain-ai/langsmith-javascript/issues/43)) ([caa8c27](https://github.com/langchain-ai/langsmith-javascript/commit/caa8c2747356093843f8a57f5ea08fdaed92e9b9))


### Chores

* move sandbox auth options to the bottom of README.md ([#44](https://github.com/langchain-ai/langsmith-javascript/issues/44)) ([d2d2a42](https://github.com/langchain-ai/langsmith-javascript/commit/d2d2a422166c5221df830f841e2ba6cedcc75b40))

## [0.10.11](https://github.com/langchain-ai/langsmith-javascript/compare/v0.10.10...v0.10.11) (2026-10-09)


### Bug Fixes

* **build:** ship CJS and node10 types for langsmith/vitest ([#35](https://github.com/langchain-ai/langsmith-javascript/issues/35)) ([5e450f2](https://github.com/langchain-ai/langsmith-javascript/commit/5e450f2a1194fc9986e3a9f3a84b613413235486))


### Chores

* drop the release-as pin now that 0.10.10 is out ([#34](https://github.com/langchain-ai/langsmith-javascript/issues/34)) ([af20623](https://github.com/langchain-ai/langsmith-javascript/commit/af206234d7c916e42019128ed0f76057ec9d7402))

## [0.10.10](https://github.com/langchain-ai/langsmith-javascript/compare/v0.10.10-rc.1...v0.10.10) (2026-10-09)


### Chores

* switch release-please to the stable channel ([#27](https://github.com/langchain-ai/langsmith-javascript/issues/27)) ([2045b30](https://github.com/langchain-ai/langsmith-javascript/commit/2045b301e50ddd5f0061eafa73fa4d923928a12d))

## [0.10.10-rc.1](https://github.com/langchain-ai/langsmith-javascript/compare/v0.10.4...v0.10.10-rc.1) (2026-10-09)


### Features

* **evaluators:** add code_evaluator_input to code evaluator schemas ([9a972be](https://github.com/langchain-ai/langsmith-javascript/commit/9a972bee1a46c2d730c9abb1d9d3b6f68f57ef7b))
* **feedback:** add feedback_config_id field and expose id on feedback config ([9b627a3](https://github.com/langchain-ai/langsmith-javascript/commit/9b627a38eae8aaf7e52e189d4ca5e5890b530671))
* **runs:** add prompt and completion cost detail metric fields ([c8de715](https://github.com/langchain-ai/langsmith-javascript/commit/c8de715858cea6c4e472502a34f1559820d3d7a8))
* **runs:** add prompt and completion token detail metric fields ([4041fdc](https://github.com/langchain-ai/langsmith-javascript/commit/4041fdc18fbd04cee593d35b48e521f269b2f1f0))
* **sessions:** add resolve endpoint to look up a tracing project by address ([2676daa](https://github.com/langchain-ai/langsmith-javascript/commit/2676daa2bbaf7e3a41760b01ef1ca5e1a2860d9d))


### Bug Fixes

* **ci:** accept the release-please component branch in the PR source check ([#30](https://github.com/langchain-ai/langsmith-javascript/issues/30)) ([c5f7349](https://github.com/langchain-ai/langsmith-javascript/commit/c5f7349cc986a105a5f7c4cc1972d0b469d2832f))
* prepare JS publishing and repair production sync ([cdf8d61](https://github.com/langchain-ai/langsmith-javascript/commit/cdf8d61579ece5ff47276455137b98d9dc957ad5))


### Chores

* cut the js release candidate as 0.10.10-rc.1 ([#32](https://github.com/langchain-ai/langsmith-javascript/issues/32)) ([9fbb8d7](https://github.com/langchain-ai/langsmith-javascript/commit/9fbb8d768ed4e3cd6782c8f8e2056aaa33515954))
