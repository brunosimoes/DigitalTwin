# Digital Twin Registry Service

The **Digital Twin Registry Service** provides essential functionality for managing OS-level features related to the registry. These features include the management of Docker containers, creation of PBCs (Persistent Blockchain Containers), configuration of digital twins, and more.

## Public Key for Git Service

To enable users to develop PBCs remotely via the git service, authentication is required. If users do not already have a public key, one must be generated. This process is consistent across different operating systems.

### Generating SSH Keys

1. **Locate or Generate Keys**:

   - Look for a pair of files named something like `id_dsa` or `id_rsa`, along with a matching file with a `.pub` extension.
   - The `.pub` file represents your public key, while the other file is the corresponding private key.
   - If these files are not present, you can create them using the `ssh-keygen` program. This utility is included with the SSH package on Linux/macOS systems and is bundled with Git for Windows.

2. **Placement of Keys**:
   - Store your generated keys in the mounted volume designated for the Registry module.
   - By default, this volume is located at `./Digital-Twin-Distribution/build/ssh-keys`.

### Accessing Git Service

Once the keys are in place, follow these steps to access the git service:

1. **Restart the Service**:

   - After placing the keys, restart the Digital Twin Registry Service.

2. **SSH Login**:

   - Use the following command to log in via SSH:
     ```
     ssh -i .\git-server\ssh-keys\id_rsa.pub git@localhost -p 2222
     ```

3. **Access GUI**:
   - Access the graphical user interface (GUI) at port 8080.
