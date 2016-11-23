
class { 'nginx': }

nginx::resource::vhost{ 'hello-world':
  www_root => '/www/',
}

file { "/www":
  ensure => "directory"
}

file { "/www/index.html":
  require => File["/www"],
  ensure => "file",
  content => "<!DOCTYPE html>
    <html><body>
    Hello World from Packer!\n
    </body></html>
    "
}

file { "/etc/nginx/conf.d/default.conf":
  require => Package["nginx"],
  ensure  => absent,
  notify  => Service["nginx"]
}
