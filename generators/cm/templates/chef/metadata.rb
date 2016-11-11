name 'onerun'
maintainer '<%= author_name %>'
maintainer_email '<%= author_email %>'
license '<%= license %>'
description '<%= short_description %>'
long_description '<%= long_description %>'
version '<%= version %>'
issues_url '<%= issues_url %>'
source_url '<%= source_url %>'

%w{ apt nginx }.each do |cookbook|
  depends cookbook
end

supports 'ubuntu'
