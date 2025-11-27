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

  // Add option to create a question if allowed
  if (callback.isAllowedUserDefinedQuestions()) {
    const userDefinedOption = document.createElement('option');
    userDefinedOption.value = 'user-defined';
    userDefinedOption.text = 'Enter your own question';
    questionInput.appendChild(userDefinedOption);
  }

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
    const selectedQuestion = (event.target as HTMLInputElement).value;
    if (selectedQuestion === 'user-defined') {
      // If user-defined option is selected, prompt for custom question
      const customQuestionLabel = document.createElement('label');
      customQuestionLabel.htmlFor = `${collectorKey}-question-user-defined`;
      customQuestionLabel.innerText = 'Type your question ' + idx + ':';

      const customQuestionInput = document.createElement('input');
      customQuestionInput.type = 'text';
      customQuestionInput.id = `${collectorKey}-question-user-defined`;
      customQuestionInput.placeholder = 'Type your question';

      container.lastElementChild?.before(customQuestionLabel);
      container.lastElementChild?.before(customQuestionInput);
      customQuestionInput.addEventListener('input', (e) => {
        callback.setQuestion((e.target as HTMLInputElement).value);
        console.log('Custom question ' + idx + ':', callback.getInputValue(0));
      });
    } else {
      callback.setQuestion((event.target as HTMLInputElement).value);
      console.log('Selected question ' + idx + ':', callback.getInputValue(0));
    }
  });

  answerInput.addEventListener('input', (event) => {
    callback.setAnswer((event.target as HTMLInputElement).value);
    console.log('Answer ' + idx + ':', callback.getInputValue(1));
  });
}
