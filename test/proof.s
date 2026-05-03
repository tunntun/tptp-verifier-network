cnf(p_is_true, axiom, p, file('/work/problem.p', p_is_true)).
cnf(p_is_false, axiom, ~p, file('/work/problem.p', p_is_false)).

cnf(refutation, plain, $false, inference(sr, [status(thm)], [p_is_true, p_is_false])).