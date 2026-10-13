# Security policy

## Reporting a vulnerability
Please report it privately: on GitHub, open **Security → Report a vulnerability** in this repository. Do not open a
public issue. A problem in Hozu itself (`@hozu/*`, `create-hozu`) goes to the
[Hozu repository](https://github.com/olevatorr/Hozu/security) instead.

Include the affected component and version of `@hozu/ui-kit`, the steps to reproduce, and the impact you expect. You
will get a first answer within 7 days; a fix is released as a new version on npm and credited in the release notes
unless you ask otherwise.

## Supported versions
Only the latest published version receives security fixes. The kit is copied into apps, so a fix reaches an app when
it runs `npx hozu add kit ui --sync`.
