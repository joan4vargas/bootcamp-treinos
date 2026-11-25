export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class WorkoutPlanNotActiveError extends Error {
  constructor(message = "Workout plan is not active") {
    super(message);
    this.name = "WorkoutPlanNotActiveError";
  }
}

export class RestDayError extends Error {
  constructor(message = "Workout day is a rest day") {
    super(message);
    this.name = "RestDayError";
  }
}

export class SessionAlreadyStartedError extends Error {
  constructor(message = "Workout session already started for this week") {
    super(message);
    this.name = "SessionAlreadyStartedError";
  }
}

export class SessionAlreadyCompletedError extends Error {
  constructor(message = "Workout session already completed") {
    super(message);
    this.name = "SessionAlreadyCompletedError";
  }
}
