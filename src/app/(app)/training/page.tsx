"use client";

import * as React from "react";
import { GraduationCap, Award, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TRAINING_MODULES, SAMPLE_QUIZ, type TrainingModule } from "@/lib/mock-data";
import { toast } from "sonner";

export default function TrainingPage() {
  const [quizModule, setQuizModule] = React.useState<TrainingModule | null>(null);

  const certified = TRAINING_MODULES.filter((m) => m.certified);
  const inProgress = TRAINING_MODULES.filter((m) => !m.certified);
  const overallProgress = Math.round(
    TRAINING_MODULES.reduce((sum, m) => sum + m.progress, 0) / TRAINING_MODULES.length
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-page-title">Training</h1>
        <p className="text-caption text-muted-foreground">
          SOP learning, product training, quizzes, and certificates.
        </p>
      </div>

      <Card className="shadow-soft-sm">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-small-label font-medium text-muted-foreground">Overall Learning Progress</p>
            <p className="text-page-title">{overallProgress}%</p>
          </div>
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <Award className="size-4 text-primary" />
            {certified.length} certificate{certified.length === 1 ? "" : "s"} earned
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-section-title">In Progress</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inProgress.map((module) => (
            <Card key={module.id} className="shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
              <CardHeader>
                <div className="mb-1 flex size-9 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                  <GraduationCap className="size-5" />
                </div>
                <CardTitle className="text-card-title">{module.title}</CardTitle>
                <CardDescription>
                  {module.category} · {module.lessonsCompleted}/{module.lessonsTotal} lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Progress value={module.progress} />
                <span className="text-caption text-muted-foreground">{module.progress}% complete</span>
              </CardContent>
              <CardFooter>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setQuizModule(module)}
                >
                  {module.progress < 70 ? "Continue Learning" : "Take Quiz"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-section-title">Certificates Earned</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certified.map((module) => (
            <Card key={module.id} className="shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
              <CardHeader>
                <div className="mb-1 flex size-9 items-center justify-center rounded-[var(--radius-lg)] bg-success/10 text-success">
                  <Award className="size-5" />
                </div>
                <CardTitle className="text-card-title">{module.title}</CardTitle>
                <CardDescription>{module.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="gap-1 text-success">
                  <CheckCircle2 className="size-3" />
                  Certified
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <QuizDialog
        module={quizModule}
        onOpenChange={(open) => !open && setQuizModule(null)}
      />
    </div>
  );
}

function QuizDialog({
  module,
  onOpenChange,
}: {
  module: TrainingModule | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (module) {
      setAnswers({});
      setSubmitted(false);
    }
  }, [module]);

  const score = SAMPLE_QUIZ.filter((q) => answers[q.id] === q.correctIndex).length;
  const passed = score / SAMPLE_QUIZ.length >= 0.7;

  function handleSubmit() {
    setSubmitted(true);
    if (passed) {
      toast.success(`Quiz passed! ${score}/${SAMPLE_QUIZ.length} correct — certificate earned (demo only)`);
    } else {
      toast.error(`Quiz not passed — ${score}/${SAMPLE_QUIZ.length} correct. Try again.`);
    }
  }

  return (
    <Dialog open={module !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{module?.title} — Quiz</DialogTitle>
          <DialogDescription>
            Answer all questions. You need 70% to pass and earn your certificate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {SAMPLE_QUIZ.map((q, qIndex) => (
            <div key={q.id} className="flex flex-col gap-2">
              <p className="font-medium">
                {qIndex + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-1.5">
                {q.options.map((option, oIndex) => {
                  const isSelected = answers[q.id] === oIndex;
                  const isCorrect = oIndex === q.correctIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIndex }))}
                      className={`flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2 text-left text-caption transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                      } ${submitted && isCorrect ? "border-success bg-success/10" : ""} ${
                        submitted && isSelected && !isCorrect ? "border-destructive bg-destructive/10" : ""
                      }`}
                    >
                      {option}
                      {submitted && isSelected && (isCorrect ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < SAMPLE_QUIZ.length}
            >
              Submit Quiz
            </Button>
          ) : (
            <div className="rounded-[var(--radius-lg)] bg-muted px-3 py-2.5 text-caption">
              You scored {score}/{SAMPLE_QUIZ.length}.{" "}
              {passed ? "Certificate earned!" : "You can retake this quiz anytime."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
