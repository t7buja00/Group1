import React, { Component } from "react";
import axios from "axios";
import Token from "../Auth/token";

export default class QuestionCreate extends Component {
    constructor(props) {
        if (!Token) {
            window.location = "/login";
        }
        super(props);
        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            question: "",
            answerCheck: "",
            questionId: "",
            quizName: "",
            answers: [{ answer: "" }]
        };
        this.quiz_id = this.props.match.params.id;
    }

    componentDidMount() {
        axios
            .get("http://localhost:4000/quiz/" + this.quiz_id, {
                headers: { authorization: Token }
            })
            .then(res => {
                this.setState({ quizName: res.data[0].name });
            });
    }

    handleAddAnswer = () => {
        this.setState({
            answers: this.state.answers.concat([{ answer: "" }])
        });
    };

    handleAnswerChange = idx => evt => {
        const newAnswer = this.state.answers.map((answer, sidx) => {
            if (idx !== sidx) return answer;
            return {
                ...answer,
                answer: evt.target.value
            };
        });
        this.setState({ answers: newAnswer });
    };

    onChange = e => {
        let correctRadio = document.getElementsByName("answerCheck");
        for (let i = 0; i < correctRadio.length; i++) {
            if (correctRadio[i].checked) {
                this.setState({ answerCheck: correctRadio[i].id });
            }
        }
        const state = this.state;
        state[e.target.name] = e.target.value;
        this.setState(state);
    };

    handleSubmit = event => {
        event.preventDefault();
        let submit = 0;
        if (event.target.name === "submit") {
            submit = 1;
        }
        const { question } = this.state;
        const quiz_id = this.quiz_id;
        axios
            .post("http://localhost:4000/question_create", {
                headers: { authorization: Token },
                quiz_id,
                question
            })
            .then(res => {
                axios
                    .get("http://localhost:4000/question_create", {
                        headers: { authorization: Token }
                    })
                    .then(res => {
                        this.setState({ questionId: res.data[0].id });
                        if (res) {
                            const {
                                answers,
                                questionId,
                                answerCheck
                            } = this.state;
                            axios
                                .post("http://localhost:4000/answer_create", {
                                    headers: { authorization: Token },
                                    answers,
                                    questionId,
                                    answerCheck
                                })
                                .then(res => {
                                    if (submit) {
                                        window.location = "/quizlanding";
                                    } else {
                                        window.location =
                                            "/questioncreate/" + this.quiz_id;
                                    }
                                });
                        }
                    });
            });
    };

    render() {
        return (
            <div>
                <h2>Add questions to {this.state.quizName}</h2>
                <div className="questionCreateBox">
                    <input
                        type="text"
                        name="question"
                        placeholder="Question"
                        onChange={this.onChange}
                    />
                    {this.state.question && this.state.answerCheck ? (
                    <div
                        className="addQuestionButton"
                        onClick={this.handleSubmit}
                    >
                        Add another question
                    </div>)
                    :(<div/>)}
                    <div className="questionCreateCorrect">Correct?</div>
                    <div className="questionCreateAnswer">
                        {this.state.answers.map((answers, idx) => (
                            <div className="questionCreateAnswerInside">
                                <input
                                    type="text"
                                    name="answer"
                                    placeholder={`Answer ${idx + 1}`}
                                    value={answers.answer}
                                    onChange={this.handleAnswerChange(idx)}
                                />
                                <input
                                    type="radio"
                                    name="answerCheck"
                                    id={idx}
                                    value={idx}
                                    onChange={this.onChange}
                                />
                            </div>
                        ))}
                    </div>
                    <br />
                    <div
                        className="addAnswerButton"
                        onClick={this.handleAddAnswer}
                    >
                        Add another answer
                    </div>
                    {this.state.question && this.state.answerCheck ? (
                        <div
                            className="addAnswerButton"
                            onClick={this.handleSubmit}
                        >
                            Submit quiz
                        </div>
                    ) : (
                        <div className="completeQuestion">Please complete question</div>
                    )}
                </div>
            </div>
        );
    }
}
