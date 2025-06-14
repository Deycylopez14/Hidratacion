"use client";
import { useState } from "react";
import AppHeader from "../components/AppHeader";

const achievements = [
	{
		id: 1,
		name: "Primera ingesta registrada",
		desc: "Registra tu primer consumo de agua",
		icon: "🥤",
		achieved: true,
	},
	{
		id: 2,
		name: "Semana perfecta",
		desc: "Cumple tu meta diaria 7 días seguidos",
		icon: "🏅",
		achieved: false,
	},
	{
		id: 3,
		name: "Hábito de hidratación evol...",
		desc: "Registra consumo 30 días seguidos",
		icon: "📅",
		achieved: false,
	},
	{
		id: 4,
		name: "Progreso de hidratación comp...",
		desc: "Registra 100 consumos en total",
		icon: "💧",
		achieved: false,
	},
	{
		id: 5,
		name: "Superador: nivel principiante",
		desc: "Cumple tu meta diaria 3 días seguidos",
		icon: "⭐",
		achieved: false,
	},
	{
		id: 6,
		name: "Superador: nivel avanzado",
		desc: "Cumple tu meta diaria 14 días seguidos",
		icon: "🏆",
		achieved: false,
	},
	{
		id: 7,
		name: "1 barril de agua",
		desc: "Acumula 159 litros (1 barril)",
		icon: "🛢️",
		achieved: false,
	},
	{
		id: 8,
		name: "5 barriles de agua",
		desc: "Acumula 795 litros (5 barriles)",
		icon: "🛢️🛢️🛢️🛢️🛢️",
		achieved: false,
	},
	{
		id: 9,
		name: "10 barriles de agua",
		desc: "Acumula 1590 litros (10 barriles)",
		icon: "💧🛢️🛢️🛢️🛢️🛢️🛢️🛢️🛢️🛢️🛢️",
		achieved: false,
	},
];

export default function LogrosPage() {
	const [tab, setTab] = useState("todos");

	return (
		<div className="min-h-screen bg-lightblue text-darkblue">
			<AppHeader />
			<main className="max-w-2xl mx-auto p-4 mt-6">
				<h1 className="text-2xl font-bold mb-6 text-darkblue">Logros</h1>
				<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
					<div className="flex border-b border-primary/30 mb-4">
						<button
							className={`flex-1 py-2 font-semibold text-lg transition-colors ${
								tab === "todos"
									? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
									: "text-[var(--color-muted)] dark:text-[var(--color-muted)]"
							}`}
							onClick={() => setTab("todos")}
						>
							Todos
						</button>
						<button
							className={`flex-1 py-2 font-semibold text-lg transition-colors ${
								tab === "conseguidos"
									? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
									: "text-[var(--color-muted)] dark:text-[var(--color-muted)]"
							}`}
							onClick={() => setTab("conseguidos")}
						>
							Conseguidos
						</button>
					</div>
					<section className="mb-6">
						<h2 className="text-xl font-bold mb-2 text-[var(--color-primary-dark)] dark:text-[var(--color-accent)]">
							Desafíos
						</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
							{achievements
								.filter((a) => tab === "todos" || a.achieved)
								.map((a) => (
									<div
										key={a.id}
										className={`flex flex-col items-center p-3 rounded-xl shadow-md border transition-all duration-200 ${
											a.achieved
												? "bg-blue-100 border-blue-400"
												: "bg-[var(--color-white)] dark:bg-[#1e293b] border-gray-200 dark:border-gray-700 opacity-60"
										}`}
									>
										<div className="text-4xl mb-2">{a.icon}</div>
										<div
											className={`font-bold text-center text-base ${
												a.achieved
													? "text-[var(--color-primary-dark)]"
													: "text-[var(--color-muted)] dark:text-[var(--color-muted)]"
											}`}
										>
											{a.name}
										</div>
										<div className="text-xs text-center text-[var(--color-muted)] dark:text-[var(--color-muted)] mt-1">
											{a.desc}
										</div>
									</div>
								))}
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
