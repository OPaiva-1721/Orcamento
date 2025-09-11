'use client';

import { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import NewTodo from '../../components/NewTodo';

export default function Home() {
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    const { data } = await supabase.from('todos').select('*');
    setTodos(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Tarefas</h1>
      <NewTodo reload={fetchTodos} />
      <div className="mt-4">
        {todos.map((todo) => (
          <p key={todo.id} className="p-2 border rounded mb-2">
            {todo.title}
          </p>
        ))}
      </div>
    </div>
  );
}
