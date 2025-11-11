import TodoList from './todo-list';

export default function TodosPage() {
  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-2xl font-bold font-headline tracking-tight">
          Today's Tasks
        </h2>
        <p className="text-muted-foreground">
          What will you accomplish today?
        </p>
      </header>
      <TodoList />
    </div>
  );
}
