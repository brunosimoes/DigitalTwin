const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const { promisify } = require("util");
const { exec } = require("child_process");

const projectsRootDir = path.dirname(path.dirname(process.cwd()));

const getRegistryModules = () => {
  const registryPath = path.join(process.cwd(), "data", "modules.json");
  if (!fs.existsSync(registryPath)) {
    console.error(`Registry not found ${registryPath}`);
    return;
  }
  const registry = require(registryPath);
  return registry;
};

const getTempDirectories = () => {
  return [
    path.join(projectsRootDir, "Digital-Twin-Distribution", "build"),
    path.join(projectsRootDir, "Digital-Twin"),
  ];
};

const cleanProject = async (projectPath) => {
  console.log(`Running yarn clean for ${path.basename(projectPath)}...`);
  try {
    await promisify(exec)("yarn clean", { cwd: projectPath });
  } catch (err) {}
};

const deleteDirectory = (directoryPath) => {
  if (fs.existsSync(directoryPath)) {
    try {
      fs.rmSync(directoryPath, { recursive: true });
      console.log(`${directoryPath} deleted successfully`);
    } catch (err) {
      console.error(`Error deleting ${directoryPath}`, err);
    }
  }
};

async function cleanAllProjectsInPath(basePath) {
  try {
    const files = await fsp.readdir(basePath);
    for (const file of files) {
      const filePath = path.join(basePath, file);
      const stats = await fsp.stat(filePath);
      if (stats.isDirectory()) {
        console.log("Cleaning project " + filePath);
        await cleanProject(filePath);
      }
    }
  } catch (error) {
    console.error("Error cleaning projects:", error);
  }
}

const clearProjectTempFiles = async (modules, rootProjects) => {
  for (const project of Object.values(modules)) {
    if (!project.rootDir) {
      console.error("[ERROR] Project root missing: ", project.id);
      continue;
    }

    const projectPath = path.resolve(
      path.join(
        projectsRootDir,
        rootProjects.includes(project.id) ? "" : "Digital-Twin-Capabilities",
        project.rootDir,
      ),
    );

    await cleanProject(projectPath);
  }

  // Delete digital twin directories
  getTempDirectories().forEach((directoryPath) => {
    deleteDirectory(directoryPath);
  });

  await cleanAllProjectsInPath(path.join(projectsRootDir, "Digital-Twin-Apps"));
};

const modules = getRegistryModules();
if (modules) {
  clearProjectTempFiles(modules, ["pbcRegistry", "pbcApp"]);
} else {
  console.log("Modules not found");
}
