import { NextResponse } from "next/server"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function successResponse(data: unknown, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  })
}

export function errorResponse(error: ApiError | Error, statusCode: number = 500) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "An unexpected error occurred",
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

export function validationErrorResponse(errors: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: errors,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  )
}
