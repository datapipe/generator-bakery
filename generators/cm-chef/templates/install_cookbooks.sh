
#!/bin/bash
COOKBOOK_DIRECTORY='berks-cookbooks'
RUBY_CMD='chruby'
BUNDLE_CMD='bundle'

# source /usr/local/share/chruby/chruby.sh is bit of a hack - necessary because this shell script is running non-interactive shell
# and thus ~/.bashrc is not loaded. https://github.com/capistrano/chruby/issues/7
#
# this sets up chruby if it exists.  otherwise default to system ruby
CHRUBY_SCRIPT="/usr/local/share/chruby/chruby.sh"
test -f $CHRUBY_SCRIPT && source $CHRUBY_SCRIPT
if type chruby > /dev/null 2>&1; then
  chruby 2.3.1
fi

if type "$BUNDLE_CMD" > /dev/null; then
  bundle
fi

if [ -d "$COOKBOOK_DIRECTORY" ]; then
  rm -rf "$COOKBOOK_DIRECTORY"
  echo '==> removed previous berks-cookbooks installation, so there are no nested cookbooks'
fi
berks vendor
