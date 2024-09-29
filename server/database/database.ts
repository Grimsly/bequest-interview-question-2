const { VersionControlSync } = require("json-version-control");
import { readFile, unlink, readdir, rm } from "fs/promises";

const config = {
  sourceFilePath: "./data/source.json",
  headFilePath: "./data/head.json",
  historyDirectory: "./data/history",
  diffFilePrefix: "diff_",
};

export type DatabaseData = {
  data: string;
  pill: string;
};

const vc = new VersionControlSync(config);

/**
 * Insert the data to the JSON database
 * @param data Data to be inserted into the database
 */
export function insertData(data: DatabaseData) {
  vc.saveNewVersion(data);
}

/**
 * Retrieve the latest data in the database
 * @returns Latest data in the database
 */
export async function getCurrentData() {
  try {
    let data = JSON.parse(await readFile(config.sourceFilePath, "utf8"));
    return data;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

/**
 * Retrieve the previous data version in the database
 * @returns Previous data version in the database
 */
export async function getPreviousVersionData() {
  const previousVersion = vc.getPreviousVersion();
  if (previousVersion) {
    vc.applyVersionToSource(previousVersion);
    const history = vc.getHistoryVersions();
    const version_index = findVersionHistory(previousVersion, history);
    if (version_index !== -1) {
      await deleteHistory(version_index, history);
    }
    return await getCurrentData();
  } else {
    // If there is no previous version of the data, then delete the database
    const delete_success = await deleteDatabaseHistory();

    if (delete_success) {
      throw new Error(
        "No previous data version was found. Reverting back to initial state."
      );
    } else {
      throw new Error("An issue occurred.");
    }
  }
}

/**
 * Find the version history index in a list of history timestamps.
 * @param version The version timestamp
 * @param history List of history timestamps. This is assumed to be sorted.
 * @returns The index of the version in the history list
 */
function findVersionHistory(version: number, history: number[]) {
  // Assuming that the history is sorted, a binary search is used to find the index of the version
  let start = 0,
    end = history.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    if (history[mid] === version) {
      return mid;
    }

    if (history[mid] < version) {
      start = mid + 1;
    } else if (history[mid] > version) {
      end = mid - 1;
    }
  }

  return -1;
}

/**
 * Delete a portion of the history of the database
 * @param version_index The index of the current version. All history after this version will be deleted.
 * @param history The list of database history
 */
async function deleteHistory(version_index: number, history: string[]) {
  let history_files = await readdir(config.historyDirectory);
  if (history_files) {
    for (let index = version_index + 1; index < history.length; index++) {
      // As the history values are just timestamps and their respective history files contain the timestamp,
      // find the file with the timestamp then delete it
      const filename = history_files.find((file) =>
        file.includes(history[index])
      );
      try {
        unlink(`${config.historyDirectory}/${filename}`);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

/**
 * Deletes all database history
 * @returns Promise for a boolean of whether the removal of the history was successful or not
 */
async function deleteDatabaseHistory() {
  return Promise.all([
    rm(config.historyDirectory, { recursive: true }),
    rm(config.headFilePath),
    rm(config.sourceFilePath),
  ])
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}
