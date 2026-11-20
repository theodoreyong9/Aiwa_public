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

## Taking payment

A contract sees only its own events, never the ledger. To be paid (a subscription, a sale), use an ordinary transfer to the creator and have the
payer sign an action that cites the claim she paid with (`claimId`). The reader of the state checks in the ledger that this claim really went
from her to the creator (the claim created by the transfer is `activated:<claimId>:<payer>:<creator>:0:identity`) for at least the price. Never
start a period from a timestamp the payer chose: let the creator sign an `accept` with her own time. The wallet's example « Abonnement » does this,
and its tests show the forgeries to try (a claim that never existed, too small an amount, someone else's payment, a forged opening).
