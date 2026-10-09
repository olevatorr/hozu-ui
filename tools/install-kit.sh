set -e
KIT=$(cd "$(dirname "$0")/../kit" && pwd)
APP=$1
cd "$APP"
if [ ! -f kit/tv.ts ]; then npx hozu add kit kit >/dev/null; fi
for f in $KIT/*; do b=$(basename $f); [ "$b" = tv.ts ] || cp -R "$f" kit/; done
if [ -n "$LEGACY" ]; then sed -i '' '/: initial;/d' kit/theme.css; fi
npx hozu add kit kit --sync >/dev/null
echo installed
