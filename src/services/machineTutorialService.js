/**
 * machineTutorialService.js
 *
 * Service interface contract for the future AI-powered 3D gym machine tutorial.
 * This file documents the expected API surface so that the real implementation
 * can be plugged in without changing the page components.
 *
 * ─── STATUS: PLACEHOLDER — No AI calls are made. ──────────────────────────
 *
 * When the AI service is ready, implement each function and remove the
 * NotImplementedError throws.
 */

class NotImplementedError extends Error {
  constructor(fn) {
    super(`machineTutorialService.${fn} is not yet implemented.`);
    this.name = 'NotImplementedError';
  }
}

/**
 * Identifies a gym machine from an image file.
 *
 * @param {File} imageFile - The image file to analyse.
 * @returns {Promise<{
 *   machineId: string,
 *   machineName: string,
 *   confidence: number,      // 0–1
 *   modelUrl?: string,       // URL to GLTF/GLB 3D model asset
 * }>}
 */
export async function identifyMachine(imageFile) {
  throw new NotImplementedError('identifyMachine');
}

/**
 * Fetches the tutorial content for a given machine ID.
 *
 * @param {string} machineId
 * @returns {Promise<{
 *   machineName: string,
 *   targetMuscles: string[],
 *   equipment: string,
 *   difficulty: 'beginner' | 'intermediate' | 'advanced',
 *   steps: Array<{ number: number, title: string, description: string, imageUrl?: string }>,
 *   commonMistakes: string[],
 *   safetyTips: string[],
 *   videoUrl?: string,       // URL to generated instructional video (future)
 * }>}
 */
export async function getTutorial(machineId) {
  throw new NotImplementedError('getTutorial');
}

/**
 * Uploads a user image to the server for AI processing.
 * Returns a job ID that can be polled via getJobStatus.
 *
 * @param {File} imageFile
 * @returns {Promise<{ jobId: string }>}
 */
export async function uploadForAnalysis(imageFile) {
  throw new NotImplementedError('uploadForAnalysis');
}

/**
 * Polls for the status of an AI processing job.
 *
 * @param {string} jobId
 * @returns {Promise<{
 *   status: 'pending' | 'processing' | 'done' | 'error',
 *   result?: object,   // present when status === 'done'
 *   error?: string,    // present when status === 'error'
 * }>}
 */
export async function getJobStatus(jobId) {
  throw new NotImplementedError('getJobStatus');
}
