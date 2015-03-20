import t = require("unittest/unittest");
import {MyClass} from './lib';

function main(): void {
  t.test("handles classes", function() {
    var mc = new MyClass("hello");
    t.expect(mc.field.toUpperCase(), t.equals("HELLO WORLD"));
  });
  t.test("string templates", function() {
    t.expect("$mc", t.equals("$mc"));
    var a = "hello";
    var b = "world";
    t.expect(`${a} ${b}`, t.equals("hello world"));
  });
}
