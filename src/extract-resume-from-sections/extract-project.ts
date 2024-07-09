import type {
  FeatureSet,
  ResumeSectionToLines,
  ResumeProject
} from "../types.js";
import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import {
  DATE_FEATURE_SETS,
  getHasText,
  isBold,
} from "./lib/common-features.js";
import { divideSectionIntoSubsections } from "./lib/subsections.js";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system.js";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "./lib/bullet-points.js";

export const extractProject = (sections: ResumeSectionToLines) => {
  const projects: ResumeProject[] = [];
  const projectsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["project"]);
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 1;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const PROJECT_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
    ];
    const [project, projectScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      PROJECT_FEATURE_SET,
      false
    );

    const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);

    projects.push({ project, date, descriptions });
    projectsScores.push({
      projectScores,
      dateScores,
    });
  }
  return { projects, projectsScores };
};
