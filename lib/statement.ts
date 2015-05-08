/// <reference path='../node_modules/typescript/bin/typescript.d.ts' />
import ts = require('typescript');
import base = require('./base');
import ts2dart = require('./main');

type ClassLike = ts.ClassDeclaration | ts.InterfaceDeclaration;

class StatementTranspiler extends base.TranspilerStep {
  constructor(tr: ts2dart.Transpiler) { super(tr); }

  visitNode(node: ts.Node): boolean {
    switch (node.kind) {
      case ts.SyntaxKind.EmptyStatement:
        this.emit(';');
        break;
      case ts.SyntaxKind.ReturnStatement:
        var retStmt = <ts.ReturnStatement>node;
        this.emit('return');
        if (retStmt.expression) this.visit(retStmt.expression);
        this.emit(';');
        break;
      case ts.SyntaxKind.BreakStatement:
      case ts.SyntaxKind.ContinueStatement:
        var breakContinue = <ts.BreakOrContinueStatement>node;
        this.emit(breakContinue.kind == ts.SyntaxKind.BreakStatement ? 'break' : 'continue');
        if (breakContinue.label) this.visit(breakContinue.label);
        this.emit(';');
        break;
      case ts.SyntaxKind.VariableStatement:
        var variableStmt = <ts.VariableStatement>node;
        this.visit(variableStmt.declarationList);
        this.emit(';');
        break;
      case ts.SyntaxKind.ExpressionStatement:
        var expr = <ts.ExpressionStatement>node;
        this.visit(expr.expression);
        this.emit(';');
        break;
      case ts.SyntaxKind.SwitchStatement:
        var switchStmt = <ts.SwitchStatement>node;
        this.emit('switch (');
        this.visit(switchStmt.expression);
        this.emit(')');
        this.visit(switchStmt.caseBlock);
        break;
      case ts.SyntaxKind.CaseBlock:
        this.emit('{');
        this.visitEach((<ts.CaseBlock>node).clauses);
        this.emit('}');
        break;
      case ts.SyntaxKind.CaseClause:
        var caseClause = <ts.CaseClause>node;
        this.emit('case');
        this.visit(caseClause.expression);
        this.emit(':');
        this.visitEach(caseClause.statements);
        break;
      case ts.SyntaxKind.DefaultClause:
        this.emit('default :');
        this.visitEach((<ts.DefaultClause>node).statements);
        break;
      case ts.SyntaxKind.IfStatement:
        var ifStmt = <ts.IfStatement>node;
        this.emit('if (');
        this.visit(ifStmt.expression);
        this.emit(')');
        this.visit(ifStmt.thenStatement);
        if (ifStmt.elseStatement) {
          this.emit('else');
          this.visit(ifStmt.elseStatement);
        }
        break;
      case ts.SyntaxKind.ForStatement:
        var forStmt = <ts.ForStatement>node;
        this.emit('for (');
        if (forStmt.initializer) this.visit(forStmt.initializer);
        this.emit(';');
        if (forStmt.condition) this.visit(forStmt.condition);
        this.emit(';');
        if (forStmt.iterator) this.visit(forStmt.iterator);
        this.emit(')');
        this.visit(forStmt.statement);
        break;
      case ts.SyntaxKind.ForInStatement:
        // TODO(martinprobst): Dart's for-in loops actually have different semantics, they are more
        // like for-of loops, iterating over collections.
        var forInStmt = <ts.ForInStatement>node;
        this.emit('for (');
        if (forInStmt.initializer) this.visit(forInStmt.initializer);
        this.emit('in');
        this.visit(forInStmt.expression);
        this.emit(')');
        this.visit(forInStmt.statement);
        break;
      case ts.SyntaxKind.WhileStatement:
        var whileStmt = <ts.WhileStatement>node;
        this.emit('while (');
        this.visit(whileStmt.expression);
        this.emit(')');
        this.visit(whileStmt.statement);
        break;
      case ts.SyntaxKind.DoStatement:
        var doStmt = <ts.DoStatement>node;
        this.emit('do');
        this.visit(doStmt.statement);
        this.emit('while (');
        this.visit(doStmt.expression);
        this.emit(') ;');
        break;

      case ts.SyntaxKind.ThrowStatement:
        this.emit('throw');
        this.visit((<ts.ThrowStatement>node).expression);
        this.emit(';');
        break;
      case ts.SyntaxKind.TryStatement:
        var tryStmt = <ts.TryStatement>node;
        this.emit('try');
        this.visit(tryStmt.tryBlock);
        if (tryStmt.catchClause) {
          this.visit(tryStmt.catchClause);
        }
        if (tryStmt.finallyBlock) {
          this.emit('finally');
          this.visit(tryStmt.finallyBlock);
        }
        break;
      case ts.SyntaxKind.CatchClause:
        var ctch = <ts.CatchClause>node;
        if (ctch.variableDeclaration.type) {
          this.emit('on');
          this.visit(ctch.variableDeclaration.type);
        }
        this.emit('catch');
        this.emit('(');
        this.visit(ctch.variableDeclaration.name);
        this.emit(',');
        this.emit((<ts.Identifier>ctch.variableDeclaration.name).text);
        this.emitNoSpace('_stack');
        this.emit(')');
        this.visit(ctch.block);
        break;

      case ts.SyntaxKind.Block:
        this.emit('{');
        this.visitEach((<ts.Block>node).statements);
        this.emit('}');
        break;
      default:
        return false;
    }
    return true;
  }
}

export = StatementTranspiler;
