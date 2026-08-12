export const swaggerDocument = {
  openapi: "3.1.0",

  info: {
    title: "Task Management API",
    version: "1.0.0",
    description:
      "REST API for user authentication and personal task management.",
  },

  servers: [
    {
      url: "/",
      description: "Current server",
    },
  ],

  tags: [
    {
      name: "Auth",
      description: "User authentication",
    },
    {
      name: "Tasks",
      description: "Task management",
    },
    {
      name: "Dashboard",
      description: "Task dashboard statistics",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      Error: {
        type: "object",
        properties: {
          code: {
            type: "string",
          },
          details: {},
        },
      },

      ApiErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
          },
          data: {
            type: "null",
          },
          error: {
            $ref: "#/components/schemas/Error",
          },
        },
      },

      AuthRequest: {
        type: "object",
        required: ["email", "password"],
        additionalProperties: false,
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "test@example.com",
          },
          password: {
            type: "string",
            example: "password123",
          },
        },
      },

      AuthData: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "689c12345678901234567890",
          },
          email: {
            type: "string",
            format: "email",
            example: "test@example.com",
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          updated_at: {
            type: "string",
            format: "date-time",
          },
          access_token: {
            type: "string",
          },
        },
      },

      Task: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          due_date: {
            oneOf: [
              {
                type: "string",
                format: "date-time",
              },
              {
                type: "null",
              },
            ],
          },
          status: {
            type: "string",
            enum: ["to_do", "in_progress", "done"],
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          updated_at: {
            type: "string",
            format: "date-time",
          },
        },
      },

      CreateTaskRequest: {
        type: "object",
        required: ["title"],
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            maxLength: 150,
            example: "Finish frontend",
          },
          description: {
            type: "string",
            maxLength: 2000,
            example: "Complete dashboard UI",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            default: "medium",
          },
          due_date: {
            oneOf: [
              {
                type: "string",
                format: "date",
              },
              {
                type: "string",
                format: "date-time",
              },
              {
                type: "null",
              },
            ],
          },
          status: {
            type: "string",
            enum: ["to_do", "in_progress", "done"],
            default: "to_do",
          },
        },
      },

      UpdateTaskRequest: {
        type: "object",
        additionalProperties: false,
        minProperties: 1,

        properties: {
          title: {
            type: "string",
            maxLength: 150,
          },

          description: {
            type: "string",
            maxLength: 2000,
          },

          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },

          due_date: {
            oneOf: [
              {
                type: "string",
                format: "date",
              },
              {
                type: "string",
                format: "date-time",
              },
              {
                type: "null",
              },
            ],
          },

          status: {
            type: "string",
            enum: ["to_do", "in_progress", "done"],
          },
        },
      },

      Dashboard: {
        type: "object",
        properties: {
          total_tasks: {
            type: "integer",
            example: 10,
          },
          by_status: {
            type: "object",
            properties: {
              to_do: {
                type: "integer",
                example: 4,
              },
              in_progress: {
                type: "integer",
                example: 3,
              },
              done: {
                type: "integer",
                example: 3,
              },
            },
          },
          overdue_tasks: {
            type: "integer",
            example: 2,
          },
        },
      },
    },
  },

  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthRequest",
              },
            },
          },
        },

        responses: {
          "201": {
            description: "User registered successfully",
          },
          "400": {
            description: "Validation error",
          },
          "409": {
            description: "Email already exists",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthRequest",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Login successful",
          },
          "400": {
            description: "Validation error",
          },
          "401": {
            description: "Invalid credentials",
          },
        },
      },
    },

    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Get authenticated user's tasks",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["to_do", "in_progress", "done"],
            },
          },
          {
            name: "priority",
            in: "query",
            schema: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
          },
          {
            name: "sort_by",
            in: "query",
            schema: {
              type: "string",
              enum: ["due_date", "created_at"],
            },
          },
          {
            name: "sort_order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
            },
          },
        ],

        responses: {
          "200": {
            description: "Tasks fetched successfully",
          },
          "401": {
            description: "Authentication required",
          },
        },
      },

      post: {
        tags: ["Tasks"],
        summary: "Create a task",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateTaskRequest",
              },
            },
          },
        },

        responses: {
          "201": {
            description: "Task created successfully",
          },
          "400": {
            description: "Validation error",
          },
          "401": {
            description: "Authentication required",
          },
        },
      },
    },

    "/api/tasks/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get task dashboard statistics",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          "200": {
            description: "Dashboard fetched successfully",
          },
          "401": {
            description: "Authentication required",
          },
        },
      },
    },

    "/api/tasks/{task_id}": {
      parameters: [
        {
          name: "task_id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],

      get: {
        tags: ["Tasks"],
        summary: "Get a task by ID",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          "200": {
            description: "Task fetched successfully",
          },
          "404": {
            description: "Task not found",
          },
        },
      },

      patch: {
        tags: ["Tasks"],
        summary: "Update a task",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateTaskRequest",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Task updated successfully",
          },
          "400": {
            description: "Validation error",
          },
          "404": {
            description: "Task not found",
          },
        },
      },

      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          "200": {
            description: "Task deleted successfully",
          },
          "404": {
            description: "Task not found",
          },
        },
      },
    },
  },
} as const;
