# Setup Status

- [ ] `.env.local` exists with `OPENAI_API_KEY`
- [ ] `.env.local` includes optional `OPENAI_MODEL`
- [ ] `.env.local` includes `V0_API_KEY` if required

## Findings
- `.env.local` was not found in the repository, so required API keys are not currently configured.
- `.env.example` is present and lists the variables that need to be populated locally.

## Next Steps
1. Create `.env.local` at the project root.
2. Copy the keys from `.env.example` and provide real values for `OPENAI_API_KEY` (mandatory) and `V0_API_KEY` (if that integration is used).
3. Optionally set `OPENAI_MODEL` to override the default model.
