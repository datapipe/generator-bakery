
#!/bin/bash
RUBY_CMD='chruby'
BUNDLE_CMD='bundle'

# source /usr/local/share/chruby/chruby.sh is bit of a hack - necessary because this shell script is running non-interactive shell
# and thus ~/.bashrc is not loaded. https://github.com/capistrano/chruby/issues/7
#
# this sets up ruby and the process should happen on each system and will vary on based on system.
source /usr/local/share/chruby/chruby.sh
if type chruby > /dev/null 2>&1; then
  chruby 2.3.1
fi

if type "$BUNDLE_CMD" > /dev/null; then
  bundle
fi

librarian-puppet install --verbose
