# git-apply-delta

apply a git delta buffer to a git target buffer.

used by git packfiles to unpack REF and OFS delta objects.

```javascript
var apply = require('git-apply-delta')

var result = apply(delta, target)
```

### api

#### apply(Buffer delta, Buffer target) -> Buffer result

apply the delta buffer to the target buffer and return a new
buffer containing the result.

## license

MIT
