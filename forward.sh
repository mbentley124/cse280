#Used to access Phpmyadmin via an ssh tunnel. After executing this, you need to bring the task to the foreground, type in the pass, then background again.
#Of course, you can also use ssh keys. Feel free to ask me to set one up.
#This script requires you are either on-campus or using the Lehigh VPN.
#!/usr/bin/env bash
ssh -N -L 8888:127.0.0.1:8080 jsa@ssh.bus.codyben.me &