	const seleccion = {
		hiragana: false,
		katakana: false,
		kanji: false,
		modo: "opciones",
		cantidad: null,
	};

	const hiraganaCharacters = [
		{ kana: "あ", romaji: "a" }, { kana: "い", romaji: "i" }, { kana: "う", romaji: "u" }, { kana: "え", romaji: "e" }, { kana: "お", romaji: "o" },
		{ kana: "か", romaji: "ka" }, { kana: "き", romaji: "ki" }, { kana: "く", romaji: "ku" }, { kana: "け", romaji: "ke" }, { kana: "こ", romaji: "ko" },
		{ kana: "さ", romaji: "sa" }, { kana: "し", romaji: "shi" }, { kana: "す", romaji: "su" }, { kana: "せ", romaji: "se" }, { kana: "そ", romaji: "so" },
		{ kana: "た", romaji: "ta" }, { kana: "ち", romaji: "chi" }, { kana: "つ", romaji: "tsu" }, { kana: "て", romaji: "te" }, { kana: "と", romaji: "to" },
		{ kana: "な", romaji: "na" }, { kana: "に", romaji: "ni" }, { kana: "ぬ", romaji: "nu" }, { kana: "ね", romaji: "ne" }, { kana: "の", romaji: "no" },
		{ kana: "は", romaji: "ha" }, { kana: "ひ", romaji: "hi" }, { kana: "ふ", romaji: "fu" }, { kana: "へ", romaji: "he" }, { kana: "ほ", romaji: "ho" },
		{ kana: "ま", romaji: "ma" }, { kana: "み", romaji: "mi" }, { kana: "む", romaji: "mu" }, { kana: "め", romaji: "me" }, { kana: "も", romaji: "mo" },
		{ kana: "や", romaji: "ya" }, { kana: "ゆ", romaji: "yu" }, { kana: "よ", romaji: "yo" },
		{ kana: "ら", romaji: "ra" }, { kana: "り", romaji: "ri" }, { kana: "る", romaji: "ru" }, { kana: "れ", romaji: "re" }, { kana: "ろ", romaji: "ro" },
		{ kana: "わ", romaji: "wa" }, { kana: "を", romaji: "wo" }, { kana: "ん", romaji: "n" },
	];
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
	let questions = [];
	let currentQuestionIndex = 0;
	let correctAnswers = 0;
	let answered = false;

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
		if (!seleccion.cantidad) {
			setupError.textContent = "Selecciona cuántos caracteres quieres practicar.";
			setupError.hidden = false;
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
			if (radio.checked) seleccion.cantidad = Number(radio.value);
		});
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
		questions = shuffle(hiraganaCharacters).slice(0, seleccion.cantidad);
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
			const distractors = shuffle(hiraganaCharacters.filter((item) => item.romaji !== question.romaji)).slice(0, 3);
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
