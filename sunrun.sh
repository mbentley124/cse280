#Assumes that you have mounted the / directory on a Sunlab machine using cifs/fuse.
#https://confluence.cc.lehigh.edu/display/hpc/Linux+Software you can adapt from this, or use sshfs:
#sshfs jsa@bus.codyben.me:/ <mount_point>

#unmount like so: fusermount -u <mount_point>


#below, I used /mnt/sunexec as my mount point.

export SUNLAB_JDK_VERS="jdk1.8.0_102"
export SUNLAB_JAVA_INSTALL="/mnt/sunexec/usr/java/${SUNLAB_JDK_VERS}/bin/"
export SUNLAB_JAVA="${SUNLAB_JAVA_INSTALL}java"
export SUNLAB_JAVAC="${SUNLAB_JAVA_INSTALL}javac"
export SUNLAB_JAR="/mnt/sunexec/usr/java/${SUNLAB_JDK_VERS}/bin/jar"
export SUNLAB_SQL_CP="/mnt/sunexec/usr/java/*:" #can be directly substituted into the java classpath argument.

#heavily adapted and toned down from script used in my (cob322) CSE-341 Final Project and Island Beach Research BDA Tool.

