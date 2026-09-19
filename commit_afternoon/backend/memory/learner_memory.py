import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from typing import Dict, Any

Base = declarative_base()

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    student_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    attempts = relationship("Attempt", back_populates="student")

class Attempt(Base):
    __tablename__ = 'attempts'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(String, unique=True, nullable=False)
    student_id = Column(String, ForeignKey('students.student_id'), nullable=False)
    topic = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    score = Column(Float, nullable=True)
    total_questions = Column(Integer, nullable=True)
    
    student = relationship("Student", back_populates="attempts")
    question_results = relationship("QuestionResult", back_populates="attempt")

class QuestionResult(Base):
    __tablename__ = 'question_results'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(String, ForeignKey('attempts.attempt_id'), nullable=False)
    question_id = Column(String, nullable=True)
    sub_concept = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    attempt = relationship("Attempt", back_populates="question_results")

class SubconceptMastery(Base):
    __tablename__ = 'subconcept_mastery'
    id = Column(Integer, primary_key=True)
    student_id = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    sub_concept = Column(String, nullable=False)
    attempts = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    status = Column(String, default="unknown")  # unknown, weak, developing, strong
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Misconception(Base):
    __tablename__ = 'misconceptions'
    id = Column(Integer, primary_key=True)
    student_id = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    sub_concept = Column(String, nullable=False)
    misconception = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    active = Column(Boolean, default=True)

class Intervention(Base):
    __tablename__ = 'interventions'
    id = Column(Integer, primary_key=True)
    student_id = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    sub_concept = Column(String, nullable=False)
    misconception = Column(Text, nullable=True)
    strategy = Column(String, nullable=False)
    intervention_text = Column(Text, nullable=False)
    cycle_number = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Verification(Base):
    __tablename__ = 'verifications'
    id = Column(Integer, primary_key=True)
    student_id = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    sub_concept = Column(String, nullable=False)
    cycle_number = Column(Integer, default=1)
    score = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    evidence = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class LearnerMemory:
    def __init__(self, db_path="backend/data/edunexus.db"):
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self.engine = create_engine(f"sqlite:///{db_path}", echo=False)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def create_student(self, student_id: str):
        with self.Session() as session:
            student = session.query(Student).filter_by(student_id=student_id).first()
            if not student:
                student = Student(student_id=student_id)
                session.add(student)
                session.commit()
            return student

    def get_student(self, student_id: str):
        with self.Session() as session:
            return session.query(Student).filter_by(student_id=student_id).first()

    def create_attempt(self, attempt_id: str, student_id: str, topic: str):
        with self.Session() as session:
            attempt = session.query(Attempt).filter_by(attempt_id=attempt_id).first()
            if not attempt:
                attempt = Attempt(attempt_id=attempt_id, student_id=student_id, topic=topic)
                session.add(attempt)
                session.commit()
            return attempt

    def save_question_result(
        self, attempt_id: str, sub_concept: str, question: str, 
        student_answer: str, correct_answer: str, is_correct: bool, question_id: str = None
    ):
        with self.Session() as session:
            result = QuestionResult(
                attempt_id=attempt_id,
                sub_concept=sub_concept,
                question=question,
                student_answer=student_answer,
                correct_answer=correct_answer,
                is_correct=is_correct,
                question_id=question_id
            )
            session.add(result)
            session.commit()
            return result

    def complete_attempt(self, attempt_id: str):
        with self.Session() as session:
            attempt = session.query(Attempt).filter_by(attempt_id=attempt_id).first()
            if attempt:
                results = session.query(QuestionResult).filter_by(attempt_id=attempt_id).all()
                total = len(results)
                if total > 0:
                    correct = sum(1 for r in results if r.is_correct)
                    attempt.score = correct / total
                    attempt.total_questions = total
                else:
                    attempt.score = 0.0
                    attempt.total_questions = 0
                session.commit()
                return attempt
            return None

    def _determine_status(self, accuracy: float) -> str:
        if accuracy < 0.60:
            return "weak"
        elif accuracy < 0.80:
            return "developing"
        else:
            return "strong"

    def update_subconcept_performance(self, student_id: str, topic: str, sub_concept: str, is_correct: bool):
        with self.Session() as session:
            mastery = session.query(SubconceptMastery).filter_by(
                student_id=student_id, topic=topic, sub_concept=sub_concept
            ).first()
            
            if not mastery:
                mastery = SubconceptMastery(
                    student_id=student_id, 
                    topic=topic, 
                    sub_concept=sub_concept,
                    attempts=0,
                    correct=0
                )
                session.add(mastery)
                
            mastery.attempts += 1
            if is_correct:
                mastery.correct += 1
                
            mastery.accuracy = float(mastery.correct) / float(mastery.attempts)
            mastery.status = self._determine_status(mastery.accuracy)
            
            session.commit()

    def get_topic_performance(self, student_id: str, topic: str) -> Dict[str, Any]:
        with self.Session() as session:
            masteries = session.query(SubconceptMastery).filter_by(
                student_id=student_id, topic=topic
            ).all()
            
            result = {}
            for m in masteries:
                result[m.sub_concept] = {
                    "attempts": m.attempts,
                    "correct": m.correct,
                    "accuracy": m.accuracy,
                    "status": m.status
                }
            return result

    def get_learner_context(self, student_id: str, topic: str) -> str:
        context_lines = [f"Previous learner performance for {topic}:\n"]
        
        # Sub-concept performance
        perf = self.get_topic_performance(student_id, topic)
        if perf:
            context_lines.append("Sub-concept performance:")
            for sc, data in perf.items():
                acc_percent = int(data['accuracy'] * 100)
                context_lines.append(f"- {sc}: {data['attempts']} attempts, {acc_percent}% accuracy, {data['status']}")
            context_lines.append("")
        else:
            return "No previous learner history available."
            
        with self.Session() as session:
            # Misconceptions
            misconceptions = session.query(Misconception).filter_by(
                student_id=student_id, topic=topic, active=True
            ).all()
            if misconceptions:
                context_lines.append("Known misconceptions:")
                for m in misconceptions:
                    context_lines.append(f"- {m.sub_concept}: {m.misconception}\n  Evidence: {m.evidence}")
                context_lines.append("")
                
            # Interventions
            interventions = session.query(Intervention).filter_by(
                student_id=student_id, topic=topic
            ).all()
            if interventions:
                context_lines.append("Previous interventions:")
                for i in interventions:
                    context_lines.append(f"- {i.sub_concept}: {i.strategy}\n  Cycle: {i.cycle_number}")
                context_lines.append("")
                
            # Verifications
            verifications = session.query(Verification).filter_by(
                student_id=student_id, topic=topic
            ).all()
            if verifications:
                context_lines.append("Previous verification:")
                for v in verifications:
                    status = "Passed" if v.passed else "Failed"
                    context_lines.append(f"- {v.sub_concept}: {status} verification.\n  Score: {v.score}")
                context_lines.append("")

        return "\n".join(context_lines).strip()
