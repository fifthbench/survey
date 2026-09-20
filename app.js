// FifthBench Interactive Survey App Logic
document.addEventListener('DOMContentLoaded', () => {
  // Survey State
  let currentStep = -1; // -1 represents Landing Page
  const totalSteps = 6;
  let userAnswers = loadSavedState() || {};

  // DOM Elements
  const landingStep = document.getElementById('landingStep');
  const startSurveyBtn = document.getElementById('startSurveyBtn');
  const resumeSurveyBtn = document.getElementById('resumeSurveyBtn');
  const progressCard = document.querySelector('.progress-card');
  const cardControls = document.querySelector('.card-controls');
  const steps = document.querySelectorAll('.survey-step');
  const progressFill = document.getElementById('progressFill');
  const progressPercentText = document.getElementById('progressPercentText');
  const currentStepNum = document.getElementById('currentStepNum');
  const currentSectionName = document.getElementById('currentSectionName');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const alertBanner = document.getElementById('alertBanner');
  const stepDots = document.querySelectorAll('.step-dot');

  const sectionTitles = [
    'Demographics',
    'Section 1 — Buying Behaviour',
    'Section 2 — Product Idea',
    'Section 3 — Product Choices',
    'Section 4 — Brand & Trust',
    'Section 5 — Pre-order & Feedback'
  ];

  // Landing Page Buttons
  if (startSurveyBtn) {
    startSurveyBtn.addEventListener('click', () => {
      // Start Fresh: Reset answers and storage
      userAnswers = {};
      localStorage.removeItem('fifthbench_survey_answers');
      clearAllFormSelections();
      currentStep = 0;
      updateStepView();
    });
  }

  if (resumeSurveyBtn) {
    if (userAnswers && Object.keys(userAnswers).length > 0) {
      resumeSurveyBtn.style.display = 'inline-flex';
    }
    resumeSurveyBtn.addEventListener('click', () => {
      // Find the first un-answered step to resume from
      let targetStep = 0;
      for (let i = 0; i < totalSteps; i++) {
        if (!isStepCompleted(i)) {
          targetStep = i;
          break;
        }
        targetStep = i;
      }
      currentStep = targetStep;
      updateStepView();
    });
  }

  // Initialize event listeners
  initFormInteractions();
  restoreFormSelections();
  updateStepView();

  // Navigation handlers
  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateStepView();
    } else if (currentStep === 0) {
      currentStep = -1;
      updateStepView();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (validateCurrentStep()) {
      saveState();
      if (currentStep < totalSteps - 1) {
        currentStep++;
        updateStepView();
      } else {
        submitSurvey();
      }
    }
  });

  // Step Dot navigation
  stepDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (index <= currentStep || isStepCompleted(index - 1)) {
        if (validateCurrentStep()) {
          currentStep = index;
          updateStepView();
        }
      }
    });
  });

  function updateStepView() {
    // Hide alert
    alertBanner.style.display = 'none';

    // Handle Landing Page View
    if (currentStep === -1) {
      if (progressCard) progressCard.style.display = 'none';
      if (cardControls) cardControls.style.display = 'none';
      if (landingStep) landingStep.style.display = 'block';
      steps.forEach(s => s.classList.remove('active'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Survey Question Step View
    if (landingStep) landingStep.style.display = 'none';
    if (progressCard) progressCard.style.display = 'block';
    if (cardControls) cardControls.style.display = 'flex';

    // Reset any inline display overrides on survey steps
    steps.forEach(s => s.style.display = '');
    const completionStep = document.getElementById('completionStep');
    if (completionStep) completionStep.style.display = 'none';

    // Show active step
    steps.forEach((step, idx) => {
      if (idx === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update Progress Bar
    const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
    progressFill.style.width = `${progressPercent}%`;
    progressPercentText.textContent = `${progressPercent}%`;
    currentStepNum.textContent = currentStep + 1;
    currentSectionName.textContent = sectionTitles[currentStep];

    // Step dots active status
    stepDots.forEach((dot, idx) => {
      if (idx === currentStep) {
        dot.className = 'step-dot active';
      } else if (idx < currentStep) {
        dot.className = 'step-dot completed';
      } else {
        dot.className = 'step-dot';
      }
    });

    // Controls button text
    if (currentStep === 0) {
      prevBtn.style.visibility = 'visible';
      prevBtn.innerHTML = '<span>←</span> Home';
    } else {
      prevBtn.style.visibility = 'visible';
      prevBtn.innerHTML = '<span>←</span> Previous';
    }

    if (currentStep === totalSteps - 1) {
      nextBtn.innerHTML = 'Submit Survey';
    } else {
      nextBtn.innerHTML = 'Next Question <span>→</span>';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateCurrentStep() {
    if (currentStep < 0 || !steps[currentStep]) return true;
    const currentStepEl = steps[currentStep];

    // Clear previous error highlights on current step
    currentStepEl.querySelectorAll('.question-group').forEach(q => q.classList.remove('has-error'));

    const requiredQuestions = currentStepEl.querySelectorAll('[data-required="true"]');

    for (let qEl of requiredQuestions) {
      const qId = qEl.getAttribute('data-qid');
      const qType = qEl.getAttribute('data-qtype');

      if (qType === 'radio' || qType === 'concept_cards') {
        const selected = qEl.querySelector('.option-card.selected, .concept-card.selected');
        if (!selected) {
          flagInvalidQuestion(qEl, 'Please select an option to continue.');
          return false;
        }
        // If 'Other' option selected, check text input
        const isOther = selected.getAttribute('data-value') === 'Other' || selected.getAttribute('data-value') === 'other';
        if (isOther) {
          const otherInput = qEl.querySelector('.other-text-input');
          if (otherInput && !otherInput.value.trim()) {
            flagInvalidQuestion(qEl, 'Please specify your response for "Other".');
            otherInput.focus();
            return false;
          }
        }
      } else if (qType === 'checkbox') {
        const selectedBoxes = qEl.querySelectorAll('.option-card.selected');
        if (selectedBoxes.length === 0) {
          flagInvalidQuestion(qEl, 'Please select at least one option.');
          return false;
        }
        const maxSelect = parseInt(qEl.getAttribute('data-max-select') || '999');
        if (selectedBoxes.length > maxSelect) {
          flagInvalidQuestion(qEl, `Please select no more than ${maxSelect} options.`);
          return false;
        }
      } else if (qType === 'rating') {
        const selectedRating = qEl.querySelector('.rating-btn.selected');
        if (!selectedRating) {
          flagInvalidQuestion(qEl, 'Please give an appeal rating from 1 to 5.');
          return false;
        }
      }
    }

    return true;
  }

  function flagInvalidQuestion(qEl, msg) {
    qEl.classList.add('has-error');
    showAlert(msg);
    qEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearQuestionError(qEl) {
    if (!qEl) return;
    qEl.classList.remove('has-error');
    if (document.querySelectorAll('.question-group.has-error').length === 0) {
      alertBanner.style.display = 'none';
    }
  }

  const warningSvgIcon = `<svg class="alert-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  function showAlert(msg) {
    alertBanner.innerHTML = `${warningSvgIcon}<span>${msg}</span>`;
    alertBanner.style.display = 'flex';
  }

  function initFormInteractions() {
    // Radio Options
    document.querySelectorAll('[data-qtype="radio"]').forEach(qGroup => {
      const qId = qGroup.getAttribute('data-qid');
      const cards = qGroup.querySelectorAll('.option-card');
      const otherContainer = qGroup.querySelector('.other-input-container');

      cards.forEach(card => {
        card.addEventListener('click', () => {
          clearQuestionError(qGroup);
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');

          const val = card.getAttribute('data-value');
          if (val === 'Other') {
            if (otherContainer) otherContainer.classList.add('active');
          } else {
            if (otherContainer) otherContainer.classList.remove('active');
          }
          userAnswers[qId] = val === 'Other' ? (qGroup.querySelector('.other-text-input')?.value || 'Other') : val;
          saveState();
        });
      });

      const otherInput = qGroup.querySelector('.other-text-input');
      if (otherInput) {
        otherInput.addEventListener('input', (e) => {
          clearQuestionError(qGroup);
          userAnswers[qId] = `Other: ${e.target.value}`;
          saveState();
        });
      }
    });

    // Checkbox Options
    document.querySelectorAll('[data-qtype="checkbox"]').forEach(qGroup => {
      const qId = qGroup.getAttribute('data-qid');
      const cards = qGroup.querySelectorAll('.option-card');
      const maxSelect = parseInt(qGroup.getAttribute('data-max-select') || '999');

      cards.forEach(card => {
        card.addEventListener('click', () => {
          clearQuestionError(qGroup);
          const val = card.getAttribute('data-value');

          // If clicking "None of these", deselect others
          if (val === 'None of these') {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
          } else {
            // Deselect "None of these" if present
            cards.forEach(c => {
              if (c.getAttribute('data-value') === 'None of these') c.classList.remove('selected');
            });

            if (card.classList.contains('selected')) {
              card.classList.remove('selected');
            } else {
              const currentlySelected = qGroup.querySelectorAll('.option-card.selected').length;
              if (currentlySelected >= maxSelect) {
                showAlert(`You can select at most ${maxSelect} options.`);
                return;
              }
              card.classList.add('selected');
            }
          }

          const selectedValues = Array.from(qGroup.querySelectorAll('.option-card.selected'))
            .map(c => c.getAttribute('data-value'));
          userAnswers[qId] = selectedValues;
          saveState();
        });
      });
    });

    // Rating Scale buttons
    document.querySelectorAll('[data-qtype="rating"]').forEach(qGroup => {
      const qId = qGroup.getAttribute('data-qid');
      const btns = qGroup.querySelectorAll('.rating-btn');

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          clearQuestionError(qGroup);
          btns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          userAnswers[qId] = btn.getAttribute('data-value');
          saveState();
        });
      });
    });

    // Concept Cards Selection
    document.querySelectorAll('[data-qtype="concept_cards"]').forEach(qGroup => {
      const qId = qGroup.getAttribute('data-qid');
      const cards = qGroup.querySelectorAll('.concept-card');
      const otherContainer = qGroup.querySelector('.other-input-container');

      cards.forEach(card => {
        card.addEventListener('click', () => {
          clearQuestionError(qGroup);
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');

          const val = card.getAttribute('data-value');
          if (val === 'other') {
            if (otherContainer) otherContainer.classList.add('active');
          } else {
            if (otherContainer) otherContainer.classList.remove('active');
          }
          userAnswers[qId] = val;
          saveState();
        });
      });

      const otherInput = qGroup.querySelector('.other-text-input');
      if (otherInput) {
        otherInput.addEventListener('input', (e) => {
          clearQuestionError(qGroup);
          userAnswers[qId] = `Other Concept: ${e.target.value}`;
          saveState();
        });
      }
    });

    // Textarea input
    document.querySelectorAll('textarea').forEach(tx => {
      const qId = tx.getAttribute('data-qid');
      tx.addEventListener('input', (e) => {
        const qGroup = tx.closest('.question-group');
        if (qGroup) clearQuestionError(qGroup);
        userAnswers[qId] = e.target.value;
        saveState();
      });
    });
  }

  function isStepCompleted(stepIdx) {
    if (stepIdx < 0) return true;
    // Check if required questions in stepIdx are answered
    const stepEl = steps[stepIdx];
    if (!stepEl) return true;
    const requiredQuestions = stepEl.querySelectorAll('[data-required="true"]');
    for (let qEl of requiredQuestions) {
      const qId = qEl.getAttribute('data-qid');
      if (!userAnswers[qId] || (Array.isArray(userAnswers[qId]) && userAnswers[qId].length === 0)) {
        return false;
      }
    }
    return true;
  }

  function saveState() {
    try {
      localStorage.setItem('fifthbench_survey_answers', JSON.stringify(userAnswers));
    } catch (e) { }
  }

  function loadSavedState() {
    try {
      const saved = localStorage.getItem('fifthbench_survey_answers');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function restoreFormSelections() {
    if (!userAnswers) return;

    Object.keys(userAnswers).forEach(qId => {
      const val = userAnswers[qId];
      const qGroup = document.querySelector(`[data-qid="${qId}"]`);
      if (!qGroup) return;

      const qType = qGroup.getAttribute('data-qtype');

      if (qType === 'radio' || qType === 'concept_cards') {
        const cards = qGroup.querySelectorAll('.option-card, .concept-card');
        cards.forEach(card => {
          const cardVal = card.getAttribute('data-value');
          if (cardVal === val) {
            card.classList.add('selected');
            if (cardVal === 'Other' || cardVal === 'other') {
              const otherContainer = qGroup.querySelector('.other-input-container');
              if (otherContainer) otherContainer.classList.add('active');
            }
          } else if (typeof val === 'string' && val.startsWith('Other') && (cardVal === 'Other' || cardVal === 'other')) {
            card.classList.add('selected');
            const otherContainer = qGroup.querySelector('.other-input-container');
            if (otherContainer) otherContainer.classList.add('active');
            const otherInput = qGroup.querySelector('.other-text-input');
            if (otherInput) otherInput.value = val.replace(/^(Other Concept:\s*|Other:\s*)/, '');
          }
        });
      } else if (qType === 'checkbox' && Array.isArray(val)) {
        const cards = qGroup.querySelectorAll('.option-card');
        cards.forEach(card => {
          if (val.includes(card.getAttribute('data-value'))) {
            card.classList.add('selected');
          }
        });
      } else if (qType === 'rating') {
        const btns = qGroup.querySelectorAll('.rating-btn');
        btns.forEach(btn => {
          if (btn.getAttribute('data-value') === val) {
            btn.classList.add('selected');
          }
        });
      } else if (qGroup.tagName === 'TEXTAREA') {
        qGroup.value = val;
      }
    });
  }

  function clearAllFormSelections() {
    document.querySelectorAll('.option-card, .concept-card, .rating-btn').forEach(el => el.classList.remove('selected', 'has-error'));
    document.querySelectorAll('.other-input-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.other-text-input, textarea').forEach(el => el.value = '');
    document.querySelectorAll('.question-group').forEach(el => el.classList.remove('has-error'));
    if (resumeSurveyBtn) resumeSurveyBtn.style.display = 'none';
  }

  const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzxkefRwYZLNNylFuK6BnsUhKMqm-3J4Acu1qyZ6DP4Mdl75Jd5v9IEMfSo6WJeMWk-/exec';

  function submitSurvey() {
    // Default optional feedback to "no feedback" if left blank
    if (!userAnswers['improvement_idea'] || !userAnswers['improvement_idea'].trim()) {
      userAnswers['improvement_idea'] = 'no feedback';
      saveState();
    }

    // 1. Send data to Google Sheets Web App
    if (GOOGLE_SHEETS_WEB_APP_URL) {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(userAnswers)
      }).then(() => console.log('Response sent to Google Sheets'))
        .catch(err => console.error('Google Sheets submission error:', err));
    }

    // 2. Also send answers to local backend server endpoint if available
    fetch('/api/survey-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAnswers)
    }).then(res => res.json())
      .then(data => console.log('Saved to local server:', data))
      .catch(err => console.log('Saved locally in browser:', err));

    // Hide progress bar header and steps
    document.querySelector('.progress-card').style.display = 'none';
    steps.forEach(s => s.style.display = 'none');
    document.querySelector('.card-controls').style.display = 'none';

    // Show completion step
    const completionStep = document.getElementById('completionStep');
    completionStep.style.display = 'block';

    // Render Summary
    const summaryContainer = document.getElementById('summaryContainer');
    summaryContainer.innerHTML = '';

    const questionsMap = {
      'situation': 'Current Situation',
      'buying_12m': 'Items Purchased in Last 12 Months',
      'usual_spend': 'Usual Spend on Decor/Gift',
      'consider_reason': 'Reason to Consider Product',
      'appeal_rating': 'Product Appeal Rating (1-5)',
      'first_collection_design': 'Preferred First Collection Design',
      'product_option_preference': 'Product Format Preference',
      'personalisation_preference': 'Top Personalisation Choice',
      'biggest_concern': 'Biggest Concern',
      'strongest_brand_reason': 'Strongest Reason to Choose Brand',
      'brand_trust_factors': 'Must-Have Trust Factors',
      'order_channel': 'Preferred Ordering Channel',
      'preorder_comfort': 'Pre-Order Comfort Level',
      'reasonable_kit_price': 'Reasonable Complete Kit Price',
      'purchase_likelihood_899': 'Likelihood to Buy at Rs 899',
      'improvement_idea': 'Suggested Improvements / Feedback'
    };

    Object.keys(questionsMap).forEach(key => {
      if (userAnswers[key] !== undefined) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';

        const qTitle = document.createElement('div');
        qTitle.className = 'summary-q';
        qTitle.textContent = questionsMap[key];

        const aText = document.createElement('div');
        aText.className = 'summary-a';
        if (Array.isArray(userAnswers[key])) {
          aText.textContent = userAnswers[key].join(', ');
        } else {
          aText.textContent = userAnswers[key] || 'N/A';
        }

        itemDiv.appendChild(qTitle);
        itemDiv.appendChild(aText);
        summaryContainer.appendChild(itemDiv);
      }
    });

    // Edit survey handler
    const editSurveyBtn = document.getElementById('editSurveyBtn');
    if (editSurveyBtn) {
      editSurveyBtn.addEventListener('click', () => {
        currentStep = 0;
        restoreFormSelections();
        updateStepView();
      });
    }

    document.getElementById('restartBtn').addEventListener('click', () => {
      localStorage.removeItem('fifthbench_survey_answers');
      location.reload();
    });
  }
});
