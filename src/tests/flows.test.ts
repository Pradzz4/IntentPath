import { describe, expect, it } from 'vitest';
import { communicationCategories, urgentHelpFlow } from '../data/communicationFlows';
import { validateAllFlows, countCompletePaths } from '../engine/decisionTree';

describe('Communication Flows Validation', () => {
  it('has zero validation issues across all flows', () => {
    const issues = validateAllFlows([...communicationCategories, urgentHelpFlow]);
    if (issues.length > 0) {
      console.error('Validation issues found:', issues);
    }
    expect(issues).toEqual([]);
  });

  it('provides complete reachable paths for each category', () => {
    for (const flow of communicationCategories) {
      const paths = countCompletePaths(flow);
      expect(paths).toBeGreaterThan(5);
    }
    expect(countCompletePaths(urgentHelpFlow)).toBeGreaterThan(0);
  });
});
