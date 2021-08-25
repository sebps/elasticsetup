DIR="./locks"

if [ ! -d "$DIR" ]; then
  exit 1
fi

if [ -z "$(ls -A $DIR)" ]; then
  exit 0
else
  exit 1
fi
