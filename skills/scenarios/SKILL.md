# Scenarios

A scenario is something she asks again and again, kept under a name: saying the name redoes it.

- A scenario is a file `Hub/scenarios/<name>.md` in her profile repository: a title, one line that says when to use it, and the prompt
  that redoes the work, written so that a session that knows nothing can carry it out (the repository, the inputs, the kind of file, where
  it is published, to whom).
- Write one when a request is clearly repeatable, or when she asks. Improve it each time it is run and something was missing.
- A scenario never holds a secret, and never an action that cannot be taken back without saying so in its first line.
- To publish one for others, release the file with the tag `scenario-…`.
