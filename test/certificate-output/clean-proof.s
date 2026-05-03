cnf(a2, axiom, (q|~r), file('testProblem.p', a2)).
cnf(nc1, negated_conjecture, (~q), file('testProblem.p', nc1)).
cnf(a1, axiom, (r), file('testProblem.p', a1)).
cnf(c_0_3, plain, (q|~r), inference(fof_simplification,[status(thm)],[a2])).
cnf(c_0_4, negated_conjecture, (~q), inference(fof_simplification,[status(thm)],[nc1])).
cnf(c_0_5, plain, (q|~r), c_0_3).
cnf(c_0_6, axiom, (r), a1).
cnf(c_0_7, negated_conjecture, (~q), c_0_4).
cnf(c_0_8, plain, (q), inference(cn,[status(thm)],[inference(rw,[status(thm)],[c_0_5, c_0_6])])).
cnf(c_0_9, negated_conjecture, ($false), inference(cn,[status(thm)],[inference(rw,[status(thm)],[c_0_7, c_0_8])]), ['proof']).
