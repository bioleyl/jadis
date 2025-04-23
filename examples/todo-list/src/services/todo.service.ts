import { assert } from '@jadis/core';
import { Todo } from '../types/todo.type';

export class TodoService {
  private static instance: TodoService;
  private readonly todos: Todo[] = [];
  private id = 0;

  private constructor() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      this.todos.push(...JSON.parse(storedTodos));
      this.id = Math.max(...this.todos.map((todo) => todo.id)) + 1;
    }
  }

  static getInstance(): TodoService {
    TodoService.instance ??= new TodoService();
    return TodoService.instance;
  }

  getAll(): Todo[] {
    return this.todos;
  }

  add(text: string): Todo {
    const todo = {
      id: this.id++,
      text,
      completed: false,
    };
    this.todos.push(todo);
    this.saveState();
    return todo;
  }

  delete(todo: Todo): void {
    const index = this.todos.findIndex((t) => t.id === todo.id);
    assert(index !== -1, 'Todo not found');
    this.todos.splice(index, 1);
    this.saveState();
  }

  update(todo: Todo): void {
    const obj = this.getById(todo.id);
    obj.text = todo.text;
    obj.completed = todo.completed;
    this.saveState();
  }

  private getById(id: number): Todo {
    const todo = this.todos.find((t) => t.id === id);
    assert(todo, 'Todo not found');
    return todo;
  }

  private saveState(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}
