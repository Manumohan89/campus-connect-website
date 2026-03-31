// Run this script once to seed coding problems: node seed_coding.js
require('dotenv').config({ path: '../.env' });
const pool = require('../db');

const problems = [
  {
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    difficulty: 'easy',
    difficulty_order: 1,
    tags: ['array', 'hash-table'],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
    hints: ['Try using a hash map to store seen values', 'For each number, check if target - number exists in map'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, return [0, 1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    test_cases: [
      { input: '9\n4\n2 7 11 15', expected_output: '0 1', hidden: false },
      { input: '6\n3\n3 2 4', expected_output: '1 2', hidden: false },
      { input: '6\n2\n3 3', expected_output: '0 1', hidden: true },
    ],
    starter_code: {
      python: `# Read input: first line is target, second is n, third is space-separated nums
target = int(input())
n = int(input())
nums = list(map(int, input().split()))

def twoSum(nums, target):
    # Write your solution here
    pass

result = twoSum(nums, target)
print(' '.join(map(str, result)))`,
      java: `import java.util.*;
public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int target = sc.nextInt();
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
      c: `#include <stdio.h>
#include <stdlib.h>
int* twoSum(int* nums, int n, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    // Write your solution here
    return result;
}
int main() {
    int target, n;
    scanf("%d %d", &target, &n);
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    int size;
    int* r = twoSum(nums, n, target, &size);
    printf("%d %d\\n", r[0], r[1]);
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
class Solution {
    public static int[] TwoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    static void Main() {
        int target = int.Parse(Console.ReadLine());
        int n = int.Parse(Console.ReadLine());
        int[] nums = Array.ConvertAll(Console.ReadLine().Split(), int.Parse);
        int[] r = TwoSum(nums, target);
        Console.WriteLine(r[0] + " " + r[1]);
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const target = parseInt(lines[0]);
const n = parseInt(lines[1]);
const nums = lines[2].split(' ').map(Number);
function twoSum(nums, target) {
    // Write your solution here
}
const r = twoSum(nums, target);
console.log(r[0] + ' ' + r[1]);`,
    },
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
  },
  {
    title: 'Reverse a String',
    description: `Write a function that reverses a string. The input is a single string on stdin.

Print the reversed string on stdout.`,
    difficulty: 'easy',
    difficulty_order: 1,
    tags: ['string', 'two-pointers'],
    constraints: '1 <= s.length <= 10^5',
    hints: ['Use two pointers from both ends'],
    examples: [
      { input: 'hello', output: 'olleh' },
      { input: 'Hannah', output: 'hannaH' },
    ],
    test_cases: [
      { input: 'hello', expected_output: 'olleh', hidden: false },
      { input: 'Hannah', output: 'hannaH', expected_output: 'hannaH', hidden: false },
      { input: 'abcde', expected_output: 'edcba', hidden: true },
    ],
    starter_code: {
      python: `s = input().strip()
def reverseString(s):
    # Write your solution here
    pass
print(reverseString(s))`,
      java: `import java.util.*;
public class Solution {
    public static String reverseString(String s) {
        // Write your solution here
        return s;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(reverseString(sc.nextLine().trim()));
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
void reverseString(char* s) {
    // Write your solution here
}
int main() {
    char s[100005];
    fgets(s, sizeof(s), stdin);
    int n = strlen(s);
    if (s[n-1] == '\\n') s[--n] = '\\0';
    reverseString(s);
    printf("%s\\n", s);
    return 0;
}`,
      csharp: `using System;
class Solution {
    public static string ReverseString(string s) {
        // Write your solution here
        return s;
    }
    static void Main() {
        Console.WriteLine(ReverseString(Console.ReadLine().Trim()));
    }
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
function reverseString(s) {
    // Write your solution here
}
console.log(reverseString(s));`,
    },
    companies: ['Facebook', 'Amazon'],
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'easy',
    difficulty_order: 1,
    tags: ['string', 'stack'],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only',
    hints: ['Use a stack', 'Push open brackets, pop and verify on close brackets'],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    test_cases: [
      { input: '()', expected_output: 'true', hidden: false },
      { input: '()[]{}', expected_output: 'true', hidden: false },
      { input: '(]', expected_output: 'false', hidden: false },
      { input: '{[]}', expected_output: 'true', hidden: true },
      { input: '([)]', expected_output: 'false', hidden: true },
    ],
    starter_code: {
      python: `s = input().strip()
def isValid(s):
    # Write your solution here
    pass
print(str(isValid(s)).lower())`,
      java: `import java.util.*;
public class Solution {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(isValid(sc.nextLine().trim()));
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>
bool isValid(char* s) {
    // Write your solution here
    return false;
}
int main() {
    char s[10005];
    scanf("%s", s);
    printf("%s\\n", isValid(s) ? "true" : "false");
    return 0;
}`,
      csharp: `using System;
class Solution {
    public static bool IsValid(string s) {
        // Write your solution here
        return false;
    }
    static void Main() {
        Console.WriteLine(IsValid(Console.ReadLine().Trim()).ToString().ToLower());
    }
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
function isValid(s) {
    // Write your solution here
}
console.log(String(isValid(s)));`,
    },
    companies: ['Amazon', 'Bloomberg', 'Google', 'Microsoft'],
  },
  {
    title: 'Maximum Subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

This is the classic **Kadane's Algorithm** problem.`,
    difficulty: 'medium',
    difficulty_order: 2,
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    hints: [
      'At each position, decide: should I extend the current subarray or start a new one?',
      'Keep track of the maximum sum seen so far',
    ],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    test_cases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expected_output: '6', hidden: false },
      { input: '1\n1', expected_output: '1', hidden: false },
      { input: '5\n5 4 -1 7 8', expected_output: '23', hidden: false },
      { input: '4\n-1 -2 -3 -4', expected_output: '-1', hidden: true },
    ],
    starter_code: {
      python: `n = int(input())
nums = list(map(int, input().split()))
def maxSubArray(nums):
    # Write your solution here
    pass
print(maxSubArray(nums))`,
      java: `import java.util.*;
public class Solution {
    public static int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(maxSubArray(nums));
    }
}`,
      c: `#include <stdio.h>
int maxSubArray(int* nums, int n) {
    // Write your solution here
    return 0;
}
int main() {
    int n; scanf("%d", &n);
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", maxSubArray(nums, n));
    return 0;
}`,
      csharp: `using System;
class Solution {
    public static int MaxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        int[] nums = Array.ConvertAll(Console.ReadLine().Split(), int.Parse);
        Console.WriteLine(MaxSubArray(nums));
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const nums = lines[1].split(' ').map(Number);
function maxSubArray(nums) {
    // Write your solution here
}
console.log(maxSubArray(nums));`,
    },
    companies: ['Amazon', 'Microsoft', 'Google', 'Adobe'],
  },
  {
    title: 'Fibonacci Number',
    description: `The Fibonacci numbers, commonly denoted \`F(n)\`, form a sequence called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given \`n\`, calculate \`F(n)\`.

F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1`,
    difficulty: 'easy',
    difficulty_order: 1,
    tags: ['math', 'dynamic-programming', 'recursion'],
    constraints: '0 <= n <= 30',
    hints: ['Use dynamic programming or memoization', 'Simple iterative solution works perfectly here'],
    examples: [
      { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1' },
      { input: 'n = 3', output: '2', explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2' },
      { input: 'n = 4', output: '3' },
    ],
    test_cases: [
      { input: '2', expected_output: '1', hidden: false },
      { input: '3', expected_output: '2', hidden: false },
      { input: '4', expected_output: '3', hidden: false },
      { input: '10', expected_output: '55', hidden: true },
      { input: '0', expected_output: '0', hidden: true },
    ],
    starter_code: {
      python: `n = int(input())
def fib(n):
    # Write your solution here
    pass
print(fib(n))`,
      java: `import java.util.*;
public class Solution {
    public static int fib(int n) {
        // Write your solution here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(fib(sc.nextInt()));
    }
}`,
      c: `#include <stdio.h>
int fib(int n) {
    // Write your solution here
    return 0;
}
int main() {
    int n; scanf("%d", &n);
    printf("%d\\n", fib(n));
    return 0;
}`,
      csharp: `using System;
class Solution {
    public static int Fib(int n) {
        // Write your solution here
        return 0;
    }
    static void Main() {
        Console.WriteLine(Fib(int.Parse(Console.ReadLine())));
    }
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());
function fib(n) {
    // Write your solution here
}
console.log(fib(n));`,
    },
    companies: ['Apple', 'Adobe', 'Google'],
  },
  {
    title: 'Binary Search',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    difficulty: 'easy',
    difficulty_order: 1,
    tags: ['array', 'binary-search'],
    constraints: '1 <= nums.length <= 10^4\nAll integers in nums are unique\nnums is sorted in ascending order',
    hints: ['Keep track of left and right pointers', 'Check the middle element each time'],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists at index 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist' },
    ],
    test_cases: [
      { input: '9\n6\n-1 0 3 5 9 12', expected_output: '4', hidden: false },
      { input: '2\n6\n-1 0 3 5 9 12', expected_output: '-1', hidden: false },
      { input: '5\n1\n5', expected_output: '0', hidden: true },
    ],
    starter_code: {
      python: `target = int(input())
n = int(input())
nums = list(map(int, input().split()))
def search(nums, target):
    # Write your solution here
    pass
print(search(nums, target))`,
      java: `import java.util.*;
public class Solution {
    public static int search(int[] nums, int target) {
        // Write your solution here
        return -1;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int target = sc.nextInt();
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(search(nums, target));
    }
}`,
      c: `#include <stdio.h>
int search(int* nums, int n, int target) {
    // Write your solution here
    return -1;
}
int main() {
    int target, n;
    scanf("%d %d", &target, &n);
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", search(nums, n, target));
    return 0;
}`,
      csharp: `using System;
class Solution {
    public static int Search(int[] nums, int target) {
        // Write your solution here
        return -1;
    }
    static void Main() {
        int target = int.Parse(Console.ReadLine());
        int n = int.Parse(Console.ReadLine());
        int[] nums = Array.ConvertAll(Console.ReadLine().Split(), int.Parse);
        Console.WriteLine(Search(nums, target));
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const target = parseInt(lines[0]);
const n = parseInt(lines[1]);
const nums = lines[2].split(' ').map(Number);
function search(nums, target) {
    // Write your solution here
}
console.log(search(nums, target));`,
    },
    companies: ['Facebook', 'Amazon', 'Apple', 'Netflix', 'Google'],
  },
];

async function seed() {
  console.log('Seeding coding problems...');
  for (const p of problems) {
    try {
      const res = await pool.query(
        `INSERT INTO coding_problems (title, description, difficulty, difficulty_order, tags, constraints, hints, examples, starter_code, test_cases, companies, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)
         ON CONFLICT DO NOTHING
         RETURNING id, title`,
        [
          p.title, p.description, p.difficulty, p.difficulty_order,
          p.tags, p.constraints,
          JSON.stringify(p.hints || []),
          JSON.stringify(p.examples || []),
          JSON.stringify(p.starter_code || {}),
          JSON.stringify(p.test_cases || []),
          p.companies || [],
        ]
      );
      if (res.rows.length > 0) {
        console.log(`  ✅ Created: ${p.title} (id: ${res.rows[0].id})`);
      } else {
        console.log(`  ⏭️  Skipped (exists): ${p.title}`);
      }
    } catch (e) {
      console.error(`  ❌ Failed: ${p.title} — ${e.message}`);
    }
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
