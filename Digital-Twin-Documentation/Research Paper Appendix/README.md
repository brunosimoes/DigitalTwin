# Welcome to the Appendix

Thank you for your interest in our paper! Below, you'll find the code utilized in our research, along with explanations of the usage of various PBCs. Please note that, we do not disclose certain PBCs (pbcServices, pbcOrchestrator, pbcMetaverse, pbcWebRTC), although they can be implemented using the provided template from the Registry. Our modules encapsulate industrial logic and are subject to certain restrictions due to commercial licensing. However, we're committed to releasing lite versions soon, incorporating key features as open-source contributions.

## Content Overview

These React applications serve as a sample, demonstrating the integration of different features outlined in our architecture into digital twins. To utilize it, the project needs to be configured with the necessary modules either through the provided bash script or the Registry UI. Unfortunately, please note that some modules may not be available in the immediate future.

`MetaVerse.tsx`: This code pertains to a digital twin application responsible for loading 3D content and facilitating connectivity. It served as the foundational code developed for the use case: "Design of Web 3D Digital Twin for Industrial 4.0". Currently, the PBC utilized for rendering metaverse interaction is not accessible as open source.

`SceneOrchestrator.tsx`: Example of a digital twin incorporating scene orchestrator features. Presently, the PBC for scene orchestration is not available in open source.

`MetaVerseWebRTC.tsx`, `EdgeRenderer.tsx`: These files represent a digital twin editor featuring cloud rendering capabilities. They showcase two distinct examples: utilizing a Unity3D backend and a web browser node for rendering. Another component facilitates connection to these backends and provides interaction. However, the PBC WebRTC is not currently available in open source.

We appreciate your patience and understanding regarding the limitations of our provided code. Should you have any inquiries or require further assistance, please don't hesitate to reach out. Your interest in our work is truly valued!
