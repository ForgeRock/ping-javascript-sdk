{
  cachix.pull = [ "ping-javascript-sdk" ];
  cachix.push = "ping-javascript-sdk";

  env.NX_SOCKET_DIR = "/tmp/nx";
}
