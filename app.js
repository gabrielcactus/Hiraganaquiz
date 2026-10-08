	const seleccion = {
		hiragana: false,
		katakana: false,
		kanji: false,
		modo: "opciones",
		cantidad: null,
	};

	const hiraganaRows = {
		a: [{ kana: "あ", romaji: "a" }, { kana: "い", romaji: "i" }, { kana: "う", romaji: "u" }, { kana: "え", romaji: "e" }, { kana: "お", romaji: "o" }],
		ka: [{ kana: "か", romaji: "ka" }, { kana: "き", romaji: "ki" }, { kana: "く", romaji: "ku" }, { kana: "け", romaji: "ke" }, { kana: "こ", romaji: "ko" }],
		sa: [{ kana: "さ", romaji: "sa" }, { kana: "し", romaji: "shi" }, { kana: "す", romaji: "su" }, { kana: "せ", romaji: "se" }, { kana: "そ", romaji: "so" }],
		ta: [{ kana: "た", romaji: "ta" }, { kana: "ち", romaji: "chi" }, { kana: "つ", romaji: "tsu" }, { kana: "て", romaji: "te" }, { kana: "と", romaji: "to" }],
		na: [{ kana: "な", romaji: "na" }, { kana: "に", romaji: "ni" }, { kana: "ぬ", romaji: "nu" }, { kana: "ね", romaji: "ne" }, { kana: "の", romaji: "no" }],
		ha: [{ kana: "は", romaji: "ha" }, { kana: "ひ", romaji: "hi" }, { kana: "ふ", romaji: "fu" }, { kana: "へ", romaji: "he" }, { kana: "ほ", romaji: "ho" }],
		ma: [{ kana: "ま", romaji: "ma" }, { kana: "み", romaji: "mi" }, { kana: "む", romaji: "mu" }, { kana: "め", romaji: "me" }, { kana: "も", romaji: "mo" }],
		ya: [{ kana: "や", romaji: "ya" }, { kana: "ゆ", romaji: "yu" }, { kana: "よ", romaji: "yo" }],
		ra: [{ kana: "ら", romaji: "ra" }, { kana: "り", romaji: "ri" }, { kana: "る", romaji: "ru" }, { kana: "れ", romaji: "re" }, { kana: "ろ", romaji: "ro" }],
		wa: [{ kana: "わ", romaji: "wa" }, { kana: "を", romaji: "wo" }, { kana: "ん", romaji: "n" }],
	};
	const hiraganaCharacters = Object.values(hiraganaRows).flat();
	const romanizationAliases = {
		し: ["si"],
		ち: ["ti"],
		つ: ["tu"],
		ふ: ["hu"],
		を: ["o"],
		ん: ["nn", "n'"],
	};

	const selector = document.querySelector(".selector");
	const setupDialog = document.querySelector(".setup-dialog");
	const setupError = document.querySelector(".setup-error");
	const selectionError = document.querySelector(".selection-error");
	const quizScreen = document.querySelector(".quiz-screen");
	const quizBody = document.querySelector(".quiz-body");
	const quizComplete = document.querySelector(".quiz-complete");
	const answerOptions = document.querySelector(".answer-options");
	const writeAnswerForm = document.querySelector(".write-answer-form");
	const writeAnswerInput = document.querySelector("#latin-answer");
	const quizCharacter = document.querySelector(".quiz-character");
	const quizProgress = document.querySelector(".quiz-progress");
	const quizScore = document.querySelector(".quiz-score");
	const quizFeedback = document.querySelector(".quiz-feedback");
	const feedbackIcon = document.querySelector(".feedback-icon");
	const feedbackTitle = document.querySelector(".feedback-title");
	const feedbackDetail = document.querySelector(".feedback-detail");
	const nextQuestionButton = document.querySelector(".next-question-button");
	const checkAnswerButton = document.querySelector(".check-answer-button");
	const finalScore = document.querySelector(".final-score");
	const rowSummary = document.querySelector(".row-summary");
	const rowDropdownToggle = document.querySelector(".row-dropdown-toggle");
	const rowMenu = document.querySelector(".row-menu");
	const rowCheckboxes = [...document.querySelectorAll('input[name="row"]')];
	const countRadios = [...document.querySelectorAll('input[name="count"]')];
	const customCountInput = document.querySelector("#custom-count");
	const customCountControl = document.querySelector(".custom-count-control");
	const customCountHelp = document.querySelector(".custom-count-help");
	let questions = [];
	let currentQuestionIndex = 0;
	let correctAnswers = 0;
	let answered = false;

	function getSelectedCharacters() {
		return rowCheckboxes
			.filter((checkbox) => checkbox.checked)
			.flatMap((checkbox) => hiraganaRows[checkbox.value]);
	}

	function updateRowSelection() {
		const availableCount = getSelectedCharacters().length;
		const selectedRows = rowCheckboxes.filter((checkbox) => checkbox.checked).length;
		rowSummary.textContent = `${selectedRows} filas · ${availableCount} caracteres`;

		countRadios.forEach((radio) => {
			radio.disabled = availableCount === 0;
			if (radio.disabled && radio.checked) {
				radio.checked = false;
				seleccion.cantidad = null;
			}
		});

		const fullSetRadio = countRadios.find((radio) => radio.value === "todos");
		const customRadio = countRadios.find((radio) => radio.value === "personalizado");
		customCountInput.max = String(availableCount);
		customCountInput.disabled = availableCount === 0;
		customCountHelp.textContent = availableCount
			? `Elige entre 1 y ${availableCount} preguntas.`
			: "Selecciona alguna fila para indicar una cantidad.";
		customCountControl.hidden = !customRadio.checked;

		if (fullSetRadio.checked) seleccion.cantidad = availableCount;
		if (customRadio.checked && availableCount > 0) {
			const customCount = Number(customCountInput.value);
			if (!Number.isInteger(customCount) || customCount < 1) {
				seleccion.cantidad = null;
			} else {
				if (customCount > availableCount) customCountInput.value = String(availableCount);
				seleccion.cantidad = Math.min(customCount, availableCount);
			}
		}
	}

	rowDropdownToggle.addEventListener("click", () => {
		rowMenu.hidden = !rowMenu.hidden;
		rowDropdownToggle.setAttribute("aria-expanded", String(!rowMenu.hidden));
		if (!rowMenu.hidden && window.matchMedia("(max-width: 699px), (max-height: 500px) and (orientation: landscape)").matches) {
			rowMenu.scrollIntoView({ block: "nearest" });
		}
	});
	rowMenu.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			rowMenu.hidden = true;
			rowDropdownToggle.setAttribute("aria-expanded", "false");
			rowDropdownToggle.focus();
		}
	});

	rowCheckboxes.forEach((checkbox) => checkbox.addEventListener("change", updateRowSelection));
	updateRowSelection();

	document.querySelectorAll(".option-checkbox").forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			seleccion[checkbox.dataset.option] = checkbox.checked;
			if (seleccion.hiragana) selectionError.hidden = true;
		});
	});

	document.querySelector(".start-button").addEventListener("click", () => {
		if (!seleccion.hiragana) {
			selectionError.textContent = "Tienes que seleccionar una opción para continuar.";
			selectionError.hidden = false;
			return;
		}

		selectionError.hidden = true;
		setupError.hidden = true;
		setupDialog.showModal();
	});

	document.querySelector(".close-dialog").addEventListener("click", () => {
		setupDialog.close();
	});

	document.querySelector(".finish-button").addEventListener("click", () => {
		if (!seleccion.hiragana) {
			setupError.textContent = "Selecciona Hiragana para empezar.";
			setupError.hidden = false;
			return;
		}
		if (getSelectedCharacters().length === 0) {
			setupError.textContent = "Selecciona al menos una fila de hiragana.";
			setupError.hidden = false;
			return;
		}
		if (!seleccion.cantidad) {
			setupError.textContent = "Indica una cantidad válida de preguntas.";
			setupError.hidden = false;
			return;
		}
		if (countRadios.find((radio) => radio.value === "personalizado").checked && !customCountInput.validity.valid) {
			setupError.textContent = `Indica un número entre 1 y ${getSelectedCharacters().length}.`;
			setupError.hidden = false;
			customCountInput.focus();
			return;
		}

		setupDialog.close();
		startQuiz();
	});

	document.querySelectorAll('input[name="mode"]').forEach((radio) => {
		radio.addEventListener("change", () => {
			if (radio.checked) seleccion.modo = radio.value;
		});
	});

	document.querySelectorAll('.count-choice input[name="count"]').forEach((radio) => {
		radio.addEventListener("change", () => {
			if (!radio.checked) return;
			const availableCount = getSelectedCharacters().length;
			if (radio.value === "todos") {
				seleccion.cantidad = availableCount;
				customCountControl.hidden = true;
			} else {
				const currentCount = Number(customCountInput.value);
				if (!Number.isInteger(currentCount) || currentCount < 1) {
					customCountInput.value = String(Math.min(10, availableCount));
				} else if (currentCount > availableCount) {
					customCountInput.value = String(availableCount);
				}
				seleccion.cantidad = Number(customCountInput.value);
				customCountControl.hidden = false;
			}
		});
	});

	customCountInput.addEventListener("input", () => {
		seleccion.cantidad = customCountInput.validity.valid ? Number(customCountInput.value) : null;
		setupError.hidden = true;
	});

	document.querySelector(".quiz-exit").addEventListener("click", returnToSetup);
	document.querySelector(".return-button").addEventListener("click", returnToSetup);
	nextQuestionButton.addEventListener("click", showNextQuestion);

	writeAnswerForm.addEventListener("submit", (event) => {
		event.preventDefault();
		checkAnswer(writeAnswerInput.value);
	});

	function shuffle(items) {
		const shuffledItems = [...items];
		for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
		}
		return shuffledItems;
	}

	function startQuiz() {
		const selectedCharacters = getSelectedCharacters();
		questions = shuffle(selectedCharacters).slice(0, Math.min(seleccion.cantidad, selectedCharacters.length));
		currentQuestionIndex = 0;
		correctAnswers = 0;
		selector.hidden = true;
		quizScreen.hidden = false;
		quizBody.hidden = false;
		quizComplete.hidden = true;
		showQuestion();
	}

	function showQuestion() {
		const question = questions[currentQuestionIndex];
		answered = false;
		quizCharacter.textContent = question.kana;
		quizCharacter.setAttribute("aria-label", question.kana);
		quizProgress.textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
		quizScore.textContent = `Aciertos: ${correctAnswers}`;
		quizFeedback.hidden = true;
		quizFeedback.className = "quiz-feedback";
		feedbackDetail.textContent = "";
		nextQuestionButton.hidden = true;
		writeAnswerInput.disabled = false;
		writeAnswerInput.value = "";
		checkAnswerButton.disabled = false;

		if (seleccion.modo === "opciones") {
			writeAnswerForm.hidden = true;
			answerOptions.hidden = false;
			answerOptions.replaceChildren();
			const distractors = shuffle(getSelectedCharacters().filter((item) => item.romaji !== question.romaji)).slice(0, 3);
			const choices = shuffle([question, ...distractors]);

			choices.forEach((choice) => {
				const button = document.createElement("button");
				button.className = "answer-choice";
				button.type = "button";
				button.textContent = choice.romaji;
				button.dataset.answer = choice.romaji;
				button.addEventListener("click", () => checkAnswer(choice.romaji));
				answerOptions.append(button);
			});
		} else {
			answerOptions.hidden = true;
			writeAnswerForm.hidden = false;
			writeAnswerInput.focus();
		}
	}

	function checkAnswer(answer) {
		if (answered) return;
		answered = true;
		const question = questions[currentQuestionIndex];
		const normalizedAnswer = answer.trim().toLocaleLowerCase().normalize("NFKC");
		const acceptedReadings = [question.romaji, ...(romanizationAliases[question.kana] || [])];
		const isCorrect = acceptedReadings.includes(normalizedAnswer);
		if (isCorrect) correctAnswers += 1;

		quizFeedback.hidden = false;
		quizFeedback.classList.add(isCorrect ? "is-correct" : "is-incorrect");
		feedbackIcon.textContent = isCorrect ? "✓" : "×";
		feedbackTitle.textContent = isCorrect ? "¡Correcto!" : "Respuesta incorrecta";
		feedbackDetail.textContent = isCorrect
			? `${question.kana} se lee ${question.romaji}.`
			: `Tu respuesta fue ${normalizedAnswer}. La lectura correcta es ${question.romaji}.`;
		quizScore.textContent = `Aciertos: ${correctAnswers}`;

		answerOptions.querySelectorAll(".answer-choice").forEach((button) => {
			button.disabled = true;
			if (button.dataset.answer === question.romaji) button.classList.add("is-correct");
			else if (button.dataset.answer === normalizedAnswer) button.classList.add("is-incorrect");
		});
		writeAnswerInput.disabled = true;
		checkAnswerButton.disabled = true;
		answerOptions.hidden = true;
		writeAnswerForm.hidden = true;
		nextQuestionButton.hidden = false;
		nextQuestionButton.focus({ preventScroll: true });
	}

	function showNextQuestion() {
		currentQuestionIndex += 1;
		if (currentQuestionIndex < questions.length) {
			showQuestion();
			return;
		}

		quizBody.hidden = true;
		quizComplete.hidden = false;
		quizProgress.textContent = "Ronda terminada";
		finalScore.textContent = `Has acertado ${correctAnswers} de ${questions.length}.`;
	}

	function returnToSetup() {
		quizScreen.hidden = true;
		selector.hidden = false;
	}
