/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { KbaCreateCallback } from '@forgerock/journey-client/types';

export default function kbaCreateComponent(
  journeyEl: HTMLDivElement,
  callback: KbaCreateCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const container = document.createElement('div');
  const questions = callback.getPredefinedQuestions();

  container.id = collectorKey;

  // Question field
  const questionLabel = document.createElement('label');
  questionLabel.htmlFor = `${collectorKey}-question`;
  // Add index to prompt to differentiate multiple KBA callbacks
  questionLabel.innerText = callback.getPrompt() + ' ' + idx;

  // Iterate through predefined questions and create a select dropdown
  const questionInput = document.createElement('select');
  questionInput.id = `${collectorKey}-question`;

  questions.forEach((question) => {
    const option = document.createElement('option');
    option.value = question;
    option.text = question;
    questionInput.appendChild(option);
  });

  // Answer field
  const answerLabel = document.createElement('label');
  answerLabel.htmlFor = `${collectorKey}-answer`;
  answerLabel.innerText = 'Answer ' + idx + ':';

  const answerInput = document.createElement('input');
  answerInput.type = 'text';
  answerInput.id = `${collectorKey}-answer`;
  answerInput.placeholder = 'Enter your answer';

  container.appendChild(questionLabel);
  container.appendChild(questionInput);
  container.appendChild(answerLabel);
  container.appendChild(answerInput);

  journeyEl?.appendChild(container);

  // Event listeners
  questionInput.addEventListener('input', (event) => {
    callback.setQuestion((event.target as HTMLInputElement).value);
  });

  answerInput.addEventListener('input', (event) => {
    callback.setAnswer((event.target as HTMLInputElement).value);
  });
}
