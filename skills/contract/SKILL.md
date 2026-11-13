# Contracts

A contract of Aiwa is not deployed on a chain. It is a set of rules, « state + event → new state », that each person replays with the
events she holds; two people who hold the same events get the same state.

- One JavaScript file that declares the initial state and one handler per type of event, with `defineContract` (package `aiwa-lib`).
- Every action that counts (a vote, a transfer) is signed with `signedAction` and checked with `verifySignedAction` inside the handler.
  A bare `from` field proves nothing.
- A handler is pure: no clock, no randomness, no network. The same events must always give the same state.
- The identity of a contract is the hash of its source: a new version is a new contract. Say what changed.
- Test it: replay a sequence of events, including forged and duplicated ones, and check the state.
- Publish the source file with the tag `contract-…`. She publishes it from her wallet (Wallet, Contracts, Create), where it becomes a
  signed event of her own; you never hold her key.
