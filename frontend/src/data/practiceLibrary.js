// Original, concise practice prompts grouped by the app's existing topics.
// Every topic has a balanced starter set: 7 easy, 5 medium, and 3 hard.
const rawLibrary = {
  Arrays: {
    Easy: [
      ['Pair Sum', 'Return the indices of two values whose sum equals the target. Assume exactly one pair exists.'],
      ['Running Totals', 'Return an array where each position contains the sum of all values up to that position.'],
      ['Move Zeroes', 'Move every zero to the end while keeping the relative order of nonzero values.'],
      ['Best Single Trade', 'Choose one day to buy and a later day to sell; return the greatest possible profit, or zero.'],
      ['Remove Duplicates', 'Given a sorted array, remove duplicates in place and return the number of distinct values.'],
      ['Missing Number', 'An array contains distinct values from 0 through n with one missing. Find the missing value.'],
      ['Merge Sorted Arrays', 'Merge two sorted arrays into the first array in sorted order; the first has enough trailing space.'],
    ],
    Medium: [
      ['Three Values to Target', 'Return unique triples whose values sum to zero. The result must not contain duplicate triples.'],
      ['Product Except Self', 'Return each position’s product of all other values without using division.'],
      ['Longest Consecutive Run', 'Find the length of the longest run of consecutive integers in an unsorted array.'],
      ['Rotate Array', 'Rotate an array to the right by k positions in place.'],
      ['Subarray Sum Count', 'Count contiguous subarrays whose sum equals k. Values may be negative.'],
    ],
    Hard: [
      ['Water Between Bars', 'Given bar heights, compute how much rainwater is trapped after raining.'],
      ['First Missing Positive', 'Find the smallest missing positive integer in an unsorted array using O(n) time and constant extra space.'],
      ['Maximum Product Segment', 'Return the largest product of any nonempty contiguous subarray.'],
    ],
  },
  Strings: {
    Easy: [
      ['Reverse a String', 'Reverse a character array in place using constant extra space.'],
      ['Palindrome Check', 'Return whether a string is a palindrome after ignoring case and non-alphanumeric characters.'],
      ['First Unique Character', 'Return the index of the first character that occurs exactly once, or -1 if none exists.'],
      ['Valid Anagram', 'Determine whether two strings contain the same characters with the same frequencies.'],
      ['Longest Common Prefix', 'Return the longest prefix shared by every string in a list.'],
      ['Word Count', 'Count the number of words in a string; words are separated by one or more spaces.'],
      ['Character Frequency', 'Return the character that appears most often; break ties by earliest appearance.'],
    ],
    Medium: [
      ['Longest Unique Window', 'Find the length of the longest substring containing no repeated characters.'],
      ['Group Anagrams', 'Group words that are anagrams of one another. Groups may be returned in any order.'],
      ['String Compression', 'Compress consecutive repeated characters as character followed by count, in place.'],
      ['Decode Repetition', 'Decode strings where k[part] means that part is repeated k times; brackets may nest.'],
      ['Minimum Covering Window', 'Find the shortest substring containing every character of a target string with its required frequency.'],
    ],
    Hard: [
      ['Wildcard Matching', 'Match a whole string against a pattern where ? matches one character and * matches any sequence.'],
      ['Shortest Palindrome Extension', 'Prepend the fewest characters needed to make the input string a palindrome.'],
      ['Concatenated Words', 'Find every starting index where all given words appear once, consecutively, in any order.'],
    ],
  },
  'Linked List': {
    Easy: [
      ['Reverse a List', 'Reverse a singly linked list and return its new head.'],
      ['Middle Node', 'Return the middle node of a singly linked list; for an even length, return the second middle.'],
      ['Merge Two Sorted Lists', 'Merge two sorted singly linked lists and return the resulting sorted list.'],
      ['Remove List Value', 'Remove every node with a given value and return the updated head.'],
      ['Cycle Check', 'Determine whether a singly linked list contains a cycle.'],
      ['Nth Node from End', 'Remove the nth node from the end in one pass and return the head.'],
      ['List Palindrome', 'Determine whether the values in a singly linked list read the same forward and backward.'],
    ],
    Medium: [
      ['Reorder List', 'Reorder L0→L1→…→Ln as L0→Ln→L1→Ln-1 in place.'],
      ['Add Number Lists', 'Add two nonnegative integers stored in reverse digit order as linked lists.'],
      ['Find Cycle Entry', 'If a linked list has a cycle, return the node where the cycle begins; otherwise return null.'],
      ['Reverse in Groups', 'Reverse nodes in groups of k; leave a final group smaller than k unchanged.'],
      ['Copy Random List', 'Deep-copy a list whose nodes have both next and arbitrary random pointers.'],
    ],
    Hard: [
      ['Merge Many Sorted Lists', 'Merge k sorted linked lists into one sorted linked list efficiently.'],
      ['Least Recently Used Cache', 'Design an O(1) get/put cache that evicts the least recently used entry at capacity.'],
      ['Sort a Linked List', 'Sort a singly linked list in O(n log n) time using constant auxiliary list storage.'],
    ],
  },
  'Stack/Queue': {
    Easy: [
      ['Balanced Brackets', 'Determine whether every opening bracket is correctly closed in the right order.'],
      ['Stack with Minimum', 'Design a stack supporting push, pop, top, and minimum lookup in constant time.'],
      ['Queue from Stacks', 'Implement a first-in-first-out queue using two stacks.'],
      ['Remove Adjacent Pairs', 'Repeatedly remove adjacent equal characters until no such pair remains.'],
      ['Next Warmer Day', 'For each day’s temperature, find how many days until a warmer temperature; use zero if none.'],
      ['Evaluate Postfix', 'Evaluate an expression written in reverse Polish notation using integer arithmetic.'],
      ['Recent Request Counter', 'Count requests in the inclusive time range [t-3000, t] as timestamps arrive in order.'],
    ],
    Medium: [
      ['Next Greater Value', 'For each value in a circular array, find the next greater value while scanning forward.'],
      ['Largest Histogram Rectangle', 'Find the largest rectangle area that can be formed from adjacent histogram bars.'],
      ['Simplify Unix Path', 'Normalize an absolute Unix path, handling ., .., and repeated slashes.'],
      ['Sliding Window Maximum', 'Return the maximum value in every contiguous window of width k.'],
      ['Decode Nested Brackets', 'Expand an encoded string with counts and nested square-bracket groups.'],
    ],
    Hard: [
      ['Largest Rectangle in Matrix', 'Find the largest all-one rectangle in a binary matrix.'],
      ['Trapping Rainwater Stream', 'Process bar heights and report trapped water using a monotonic stack.'],
      ['Design a Max Queue', 'Design a queue supporting push-back, pop-front, and maximum lookup in amortized O(1).'],
    ],
  },
  Trees: {
    Easy: [
      ['Tree Height', 'Return the maximum number of nodes from the root to any leaf.'],
      ['Mirror a Tree', 'Invert a binary tree by swapping each node’s left and right subtrees.'],
      ['Same Tree', 'Determine whether two binary trees have identical structure and values.'],
      ['Inorder Traversal', 'Return the values of a binary tree in inorder without recursion.'],
      ['Path Sum', 'Determine whether a root-to-leaf path has values summing to a target.'],
      ['Tree Level Averages', 'Return the average node value at each depth of a binary tree.'],
      ['Check BST', 'Determine whether a binary tree satisfies strict binary-search-tree ordering.'],
    ],
    Medium: [
      ['Level Order Traversal', 'Return binary-tree values one level at a time from top to bottom.'],
      ['Build Tree from Traversals', 'Reconstruct a binary tree from its preorder and inorder traversals with unique values.'],
      ['Lowest Common Ancestor', 'Find the lowest node that is an ancestor of two given nodes in a binary tree.'],
      ['Serialize a Tree', 'Design serialization and deserialization that preserve a binary tree’s structure and values.'],
      ['BST Iterator', 'Design an iterator that returns BST values in ascending order with O(h) memory.'],
    ],
    Hard: [
      ['Maximum Path Sum', 'Find the maximum sum along any nonempty path in a binary tree.'],
      ['Count Unique Search Trees', 'Count structurally unique BSTs that can be formed using values 1 through n.'],
      ['Tree from Inorder and Postorder', 'Reconstruct a binary tree from inorder and postorder traversals with unique values.'],
    ],
  },
  Graphs: {
    Easy: [
      ['Count Islands', 'Count connected groups of land cells in a grid; horizontal and vertical neighbors connect.'],
      ['Reachable Nodes', 'Given an undirected graph and a start node, return all reachable nodes.'],
      ['Flood Fill', 'Replace the connected region of a starting cell with a new color.'],
      ['Find a Town Judge', 'Find the person trusted by everyone else who trusts nobody, or report that none exists.'],
      ['Path Exists', 'Determine whether an undirected graph contains a path between two given vertices.'],
      ['Province Count', 'Count connected components represented by a symmetric adjacency matrix.'],
      ['Shortest Grid Path', 'Find the shortest four-directional path from start to finish through open cells.'],
    ],
    Medium: [
      ['Course Schedule', 'Determine whether all courses can be completed given prerequisite pairs.'],
      ['Clone a Graph', 'Return a deep copy of a connected undirected graph with neighbor links preserved.'],
      ['Rotting Oranges', 'Find the minutes until all reachable fresh oranges become rotten, or return -1.'],
      ['Network Delay', 'Find the time for a signal to reach every node in a weighted directed graph.'],
      ['Word Transformation', 'Find the fewest one-letter changes to transform a word using only words from a dictionary.'],
    ],
    Hard: [
      ['Minimum Spanning Network', 'Connect all weighted graph vertices with minimum total edge weight.'],
      ['Critical Network Links', 'Find edges whose removal increases the number of connected components.'],
      ['Cheapest Route with Stops', 'Find the cheapest route between two cities using at most k intermediate stops.'],
    ],
  },
  DP: {
    Easy: [
      ['Climb the Steps', 'Count ways to reach step n when each move advances one or two steps.'],
      ['Nonadjacent Maximum', 'Find the largest sum of values without choosing adjacent positions.'],
      ['Minimum Coins', 'Find the fewest coins needed to make an amount, or return -1 if impossible.'],
      ['Stair Cost', 'Reach the top at minimum cost when each move advances one or two steps and landing has a cost.'],
      ['Count Grid Paths', 'Count paths from the top-left to bottom-right using only right and down moves.'],
      ['Can Reach Target', 'Determine whether a subset of positive integers sums exactly to a target.'],
      ['Maximum Subarray', 'Find the largest sum among all nonempty contiguous subarrays.'],
    ],
    Medium: [
      ['Longest Increasing Subsequence', 'Return the length of the longest strictly increasing subsequence.'],
      ['String Edit Distance', 'Find the fewest insertions, deletions, and replacements needed to transform one string into another.'],
      ['Longest Common Subsequence', 'Find the length of the longest subsequence shared by two strings.'],
      ['Equal Partition', 'Determine whether an array can be split into two subsets with equal sums.'],
      ['Count Decode Ways', 'Count ways a digit string maps to letters 1 through 26; zero cannot map alone.'],
    ],
    Hard: [
      ['Burst Balloons', 'Choose an order to burst balloons maximizing coins; each burst scores the product of adjacent values.'],
      ['Weighted Job Schedule', 'Choose non-overlapping jobs to maximize total profit when each has a start, end, and profit.'],
      ['Optimal Matrix Multiplication', 'Find the minimum scalar multiplications needed to multiply a chain of matrices.'],
    ],
  },
  'Recursion/Backtracking': {
    Easy: [
      ['Generate Subsets', 'Return every subset of a list of distinct integers.'],
      ['Power of a Number', 'Compute x raised to integer exponent n in logarithmic time, including negative exponents.'],
      ['Digit Sum', 'Return the sum of the digits of a nonnegative integer using recursion.'],
      ['Binary Strings', 'Generate all binary strings of length n that contain no consecutive ones.'],
      ['Choose k Values', 'Return every combination of k values chosen from 1 through n.'],
      ['Reverse a Stack', 'Reverse a stack using recursion and no auxiliary collection.'],
      ['Generate Parentheses', 'Return all well-formed strings containing n pairs of parentheses.'],
    ],
    Medium: [
      ['Unique Permutations', 'Return all distinct permutations of a list that may contain duplicate values.'],
      ['Word Search', 'Determine whether a word can be traced through adjacent cells without reusing a cell.'],
      ['Combination Sum', 'Find unique combinations that sum to a target; each candidate may be reused.'],
      ['Palindrome Partitions', 'Partition a string into substrings so every part is a palindrome.'],
      ['Restore IP Addresses', 'Insert three dots into a digit string to form every valid four-part IPv4 address.'],
    ],
    Hard: [
      ['Solve N-Queens', 'Place n queens on an n by n board so none attack each other; return all boards.'],
      ['Word Break Sentences', 'Return every sentence formed by splitting a string into dictionary words.'],
      ['Sudoku Solver', 'Fill an incomplete 9 by 9 Sudoku grid so each row, column, and 3 by 3 box contains 1 through 9.'],
    ],
  },
  'Binary Search': {
    Easy: [
      ['Find a Target', 'Return the index of a target in a sorted array, or -1 if it is absent.'],
      ['Insertion Position', 'Return the index where a target belongs in sorted order, before equal values.'],
      ['Integer Square Root', 'Return the floor of the square root of a nonnegative integer without floating point.'],
      ['First Bad Version', 'Find the first failing version using a boolean pass/fail query.'],
      ['Search a Range', 'Return the first and last index of a target in a sorted array, or [-1,-1].'],
      ['Peak in a Mountain', 'Find the peak index in an array that strictly rises then strictly falls.'],
      ['Closest Number', 'Return the value in a sorted array closest to a target; choose the smaller on a tie.'],
    ],
    Medium: [
      ['Rotated Array Search', 'Find a target in a rotated sorted array with distinct values in logarithmic time.'],
      ['Minimum in Rotated Array', 'Find the minimum value in a rotated sorted array with distinct values.'],
      ['Search a 2D Matrix', 'Search a matrix whose rows are sorted and whose first values exceed the previous row’s last.'],
      ['Minimum Eating Speed', 'Find the smallest integer speed that finishes all piles within h hours.'],
      ['Allocate Books', 'Split ordered book pages among m readers minimizing the largest pages assigned to one reader.'],
    ],
    Hard: [
      ['Kth of Two Sorted Arrays', 'Find the kth smallest value across two sorted arrays in logarithmic time.'],
      ['Median of Two Sorted Arrays', 'Find the median of two sorted arrays in logarithmic time.'],
      ['Smallest Divisor Threshold', 'Find the smallest positive divisor whose rounded-up quotient sum is at most a threshold.'],
    ],
  },
  Greedy: {
    Easy: [
      ['Assign Cookies', 'Maximize satisfied children by assigning each child at most one sufficiently large cookie.'],
      ['Pair for Maximum Count', 'Pair numbers so the sum of the smaller number in each pair is maximized.'],
      ['Can Reach the End', 'Determine whether jumps from each position can reach the last index.'],
      ['Buy and Sell Often', 'Find maximum stock profit when any number of buy-sell transactions are allowed.'],
      ['Minimum Arrows', 'Find the fewest arrows needed to burst all intervals, where one arrow can hit overlapping intervals.'],
      ['Assign Meeting Rooms', 'Find the minimum number of rooms required for meetings with start and end times.'],
      ['Largest Number', 'Arrange nonnegative integers to form the largest possible concatenated number.'],
    ],
    Medium: [
      ['Jump Game Minimum Moves', 'Find the minimum jumps needed to reach the last index; each value is the maximum jump length.'],
      ['Merge Overlapping Intervals', 'Merge every pair of overlapping intervals and return the disjoint result.'],
      ['Task Scheduler', 'Schedule tasks with a cooldown between identical tasks and find the shortest total time.'],
      ['Gas Station Circuit', 'Find a starting station that completes a circular route, or return -1.'],
      ['Reorganize Characters', 'Rearrange a string so no identical characters are adjacent, or report impossibility.'],
    ],
    Hard: [
      ['Minimum Taps for Garden', 'Find the fewest intervals needed to cover a garden from position zero through n.'],
      ['Minimum Refueling Stops', 'Find the fewest refueling stops needed to reach a destination when stations provide limited fuel.'],
      ['Minimum Cost to Connect Ropes', 'Repeatedly connect two ropes at cost equal to their combined length; minimize total cost.'],
    ],
  },
  Other: {
    Easy: [
      ['Count Set Bits', 'Return the number of one bits in the binary representation of a nonnegative integer.'],
      ['Single Number', 'Every value appears twice except one; find the value that appears once using constant extra space.'],
      ['Power of Two', 'Determine whether a positive integer is a power of two.'],
      ['Reverse Bits', 'Reverse all bits in a fixed-width unsigned integer and return the result.'],
      ['Majority Element', 'Find the value appearing more than half the time; such a value is guaranteed to exist.'],
      ['Happy Number', 'Repeatedly replace a number by the sum of squared digits; determine whether it reaches one.'],
      ['Add Without Plus', 'Add two integers without using the plus or minus operators.'],
    ],
    Medium: [
      ['Count Range Bitwise AND', 'Compute the bitwise AND of every integer in an inclusive range [left, right].'],
      ['Top K Frequent Values', 'Return the k most frequent values from an integer array.'],
      ['Find Duplicate Number', 'Find one repeated value in n+1 integers from 1 through n using constant extra space.'],
      ['Majority Elements', 'Return all values appearing more than one third of the time.'],
      ['Product Stream', 'Design a stream that returns the product of its most recent k values.'],
    ],
    Hard: [
      ['Maximum XOR Pair', 'Find the maximum bitwise XOR obtainable from any pair of values in an array.'],
      ['Count Smaller After Self', 'For each array position, count later values that are strictly smaller.'],
      ['Median from Data Stream', 'Design a data structure that supports insertion and median lookup as values arrive.'],
    ],
  },
};

export const PRACTICE_LIBRARY = Object.entries(rawLibrary).flatMap(([topic, levels]) =>
  Object.entries(levels).flatMap(([difficulty, entries]) =>
    entries.map(([title, description], index) => ({
      id: `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${difficulty.toLowerCase()}-${index + 1}`,
      title,
      topic,
      difficulty,
      statement: `${title}\n\n${description}\n\nImplement a clear and efficient solution. Explain your approach with code, then use the mentor hints only if you get stuck.`,
    }))
  )
);
