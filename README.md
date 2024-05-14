# Digital Twin Framework

The emergence of Digital Twin (DT) technology has revolutionized the concept of virtual replication of physical assets and processes. However, to fully harness the potential of DTs, robust and scalable frontend solutions are needed.

This repository introduces a comprehensive framework designed to streamline the development, deployment, and management of industrial software infrastructures. Think of it as a versatile alternative to mainstream cloud technologies such as Azure for infrastructure management, or even as a replacement for traditional operating systems and software catalogs like the Apple Store. Technically, this framework operates by virtualizing processes, making them executable within operating systems using tools like Docker or virtualizers directly.

## Methodology

This framework adheres to the best practices outlined by the Digital Twin Consortium, emphasizing design, modularity, and interoperability. It serves as a reference platform for implementing digital twin solutions, ensuring efficiency and scalability through the use of technologies like microservices and microfrontends.

## Key Capabilities

#1. **Service Infrastructure Management (PaaS)**:
   
This framework serves as a platform for creating new Software as a Service (SaaS) and Infrastructure as a Service (IaaS) solutions. It facilitates the delivery of both hardware and software tools to users over the internet or local machines. Key features include seamless deployment and management of industrial infrastructures, encompassing tasks like load balancing, distributed deployment, remote updates, and more. Its modular architecture enables flexible and scalable programming of features, making it an ideal choice for businesses seeking adaptability and efficiency.

#2. **Software as a Service (SaaS)**:
   
With this framework, users can effortlessly transform their features into accessible software applications, eliminating the complexities of downloads and local compilation. Leveraging microservices and microfrontends, this framework empowers businesses to deploy and scale their software applications with unparalleled ease. By abstracting away infrastructure concerns, this framework allows teams to focus on core development tasks, accelerating time-to-market and enhancing overall agility.

#3. **User Interface as a Service (IaaS)**:
   
This framework revolutionizes user interface deployment by offering a seamless "microfrontends" approach. By automating the deployment of user interfaces as a service, this framework facilitates the creation of cohesive applications that seamlessly integrate interfaces for various features. This not only enhances user experience but also simplifies application development and maintenance. Additionally, this framework supports the interaction of deployed interfaces within new applications, further enriching the user experience and promoting innovation.

#4. **Database as a Service (DBaaS)**:
   
   This framework provides a comprehensive cloud database solution, freeing users from managing underlying infrastructure. Through its managed database service, this framework handles critical tasks such as patching, upgrading, and backups, allowing users to focus on defining their data model. By abstracting away database management complexities, this framework promotes agility and reliability, enabling businesses to leverage data-driven insights without compromising efficiency or scalability.

## Repository Structure

[**Digital-Twin-Apps**](./Digital-Twin-Apps/README.md): This folder serves as a repository for digital twins, defining Packaged Business Capabilities (PBC) that orchestrate a number of PBCs. A minimal example is provided for reference and understanding.

[**Digital-Twin-Capabilities**](./Digital-Twin-Capabilities/README.md): Here, you'll find a list of PBCs for creating new Digital Twins, providing a foundational resource for developers.

[**Digital-Twin-Registry**](./Digital-Twin-Registry/README.md): This core component handles configurations across modules, compiles new modules, and provides management functionalities.

[**Digital-Twin-Plugins**](./Digital-Twin-Plugins/README.md): Contains templates for creating new PBCs, streamlining the process of developing custom DT components.

[**Digital-Twin-Documentation**](./Digital-Twin-Documentation/README.md): Here, you'll find documentation and examples. Additionally, you will find the code referenced in the research papers bellow, offering insights into implementation details and best practices.

**Digital-Twin-Distribution**: A temporary folder for initial compilation, facilitating deployment and management of the framework.

## References

The framework is elaborated upon in the following [paper](https://www.sciencedirect.com/science/article/pii/S0097849324000815): 

```
@article{TwinArk2024,
  author = {Bruno Simões and María del Puy Carretero and Jorge Martínez and Sebastián Muñoz and Nieves Alcain},
  title = {Implementing Digital Twins via micro-frontends, micro-services, and web 3D},
  journal = {Computers & Graphics},
  volume = {121},
  pages = {103946},
  year = {2024},
  issn = {0097-8493},
  doi = {https://doi.org/10.1016/j.cag.2024.103946}
}
```

## How to Contribute

If you're eager to collaborate and contribute, we warmly encourage your involvement. Don't hesitate to get in touch with us to explore potential contributions and opportunities for collaboration. For detailed guidelines, refer to [this document](./Digital-Twin-Documentation/ContributingGuidelines.md).
