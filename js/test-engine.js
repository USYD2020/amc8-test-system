/**
 * AMC8 测试引擎类
 * 功能：题目加载、答案保存、进度管理、自动提交
 */

// 内嵌题目数据 - 解决CORS问题
const QUESTIONS_DATA = [
  {
    "id": 1,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "easy",
    "content_en": "Luka is making lemonade to sell at a school fundraiser. His recipe requires 4 times as much water as sugar and twice as much sugar as lemon juice. He uses 3 cups of lemon juice. How many cups of water does he need?",
    "content_zh": "卢卡正在做柠檬水，准备在学校的募捐会上出售。他的配料表需要的水是糖的四倍，糖是柠檬汁的两倍。他用了 3 杯柠檬汁。他需要多少杯水？",
    "options": [
      { "label": "A", "text": "6" },
      { "label": "B", "text": "8" },
      { "label": "C", "text": "12" },
      { "label": "D", "text": "18" },
      { "label": "E", "text": "24" }
    ],
    "correct_answer": "E"
  },
  {
    "id": 2,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "easy",
    "content_en": "Four friends do yardwork for their neighbors over the weekend, earning \\$15, \\$20, \\$25, and \\$40, respectively. They decide to split their earnings equally among themselves. In total how much will the friend who earned \\$40 give to the others?",
    "content_zh": "四个朋友在周末为他们的邻居打扫院子，收入分别为 $15、$20、$25 和 $40。他们决定平分收入。那么赚了40美元的那个朋友总共会给其他人多少钱？",
    "options": [
      { "label": "A", "text": "$5" },
      { "label": "B", "text": "$10" },
      { "label": "C", "text": "$15" },
      { "label": "D", "text": "$20" },
      { "label": "E", "text": "$25" }
    ],
    "correct_answer": "C"
  },
  {
    "id": 3,
    "type": "multiple_choice",
    "subject": "几何",
    "difficulty": "easy",
    "content_en": "Carrie has a rectangular garden that measures 6 feet by 8 feet. She plants the entire garden with strawberry plants. Carrie is able to plant 4 strawberry plants per square foot, and she harvests an average of 10 strawberries per plant. How many strawberries can she expect to harvest?",
    "content_zh": "Carrie 有一个矩形的花园，尺寸是 6 英尺 × 8 英尺。她在整个花园里都种植了草莓。Carrie 每平方英尺种植 4 棵植株，并且每棵植株上她可以收获 10 颗草莓。那么她可以期望总共收获多少颗草莓？",
    "options": [
      { "label": "A", "text": "560" },
      { "label": "B", "text": "960" },
      { "label": "C", "text": "1120" },
      { "label": "D", "text": "1920" },
      { "label": "E", "text": "3840" }
    ],
    "correct_answer": "D"
  },
  {
    "id": 4,
    "type": "multiple_choice",
    "subject": "数列与组合",
    "difficulty": "medium",
    "content_en": "Three hexagons of increasing size are shown below. Suppose the dot pattern continues so that each successive hexagon contains one more band of dots. How many dots are in the next hexagon?",
    "content_zh": "三个面积逐渐增大的六边形如下图所示。假设这种点阵模式以此规律继续，使得后一个六边形比前一个多一层点带。那么图中下一个六边形中有多少个点？",
    "image_path": "images/question-04.png",
    "options": [
      { "label": "A", "text": "35" },
      { "label": "B", "text": "37" },
      { "label": "C", "text": "39" },
      { "label": "D", "text": "43" },
      { "label": "E", "text": "49" }
    ],
    "correct_answer": "B"
  },
  {
    "id": 5,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "easy",
    "content_en": "Three fourths of a pitcher is filled with pineapple juice. The pitcher is emptied by pouring an equal amount of juice into each of 5 cups. What percent of the total capacity of the pitcher did each cup receive?",
    "content_zh": "一个水罐装了总容积四分之三的菠萝汁。然后把水罐里所有的菠萝汁平均倒到 5 个杯子里。那么每个杯子里菠萝汁的量占了水罐总容量的百分之几？",
    "options": [
      { "label": "A", "text": "5" },
      { "label": "B", "text": "10" },
      { "label": "C", "text": "15" },
      { "label": "D", "text": "20" },
      { "label": "E", "text": "25" }
    ],
    "correct_answer": "C"
  },
  {
    "id": 6,
    "type": "multiple_choice",
    "subject": "逻辑推理",
    "difficulty": "medium",
    "content_en": "Aaron, Darren, Karen, Maren, and Sharon rode on a small train that has five cars that seat one person each. Maren sat in the last car. Aaron sat directly behind Sharon. Darren sat in one of the cars in front of Aaron. At least one person sat between Karen and Darren. Who sat in the middle car?",
    "content_zh": "Aaron，Darren，Karen，Maren，和 Sharon 乘坐一列小火车，火车有五节车厢，每节车厢可坐一人。Maren 坐在最后一节车厢里。Aaron 坐在 Sharon 的正后方。Darren 坐在亚伦前面的某节车厢里。至少有一个人坐在 Karen 和 Darren 之间。谁坐在中间的那节车厢里？",
    "options": [
      { "label": "A", "text": "Aaron" },
      { "label": "B", "text": "Darren" },
      { "label": "C", "text": "Karen" },
      { "label": "D", "text": "Maren" },
      { "label": "E", "text": "Sharon" }
    ],
    "correct_answer": "A"
  },
  {
    "id": 7,
    "type": "multiple_choice",
    "subject": "组合计数",
    "difficulty": "medium",
    "content_en": "How many integers between 2020 and 2400 have four distinct digits arranged in increasing order? (For example, 2347 is one integer.)",
    "content_zh": "2020 和 2400 之间有多少个整数，满足四个位上的数字都不相同，且按照升序排列？(例如，2347 就是满足题意的一个数)",
    "options": [
      { "label": "A", "text": "9" },
      { "label": "B", "text": "10" },
      { "label": "C", "text": "15" },
      { "label": "D", "text": "21" },
      { "label": "E", "text": "28" }
    ],
    "correct_answer": "C"
  },
  {
    "id": 8,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "hard",
    "content_en": "Ricardo has 2020 coins, some of which are pennies (1-cent coins) and the rest of which are nickels (5-cent coins). He has at least one penny and at least one nickel. What is the difference in cents between the greatest possible and least possible amounts of money that Ricardo can have?",
    "content_zh": "Ricardo 有2020枚硬币，其中一些是便士(1美分硬币)，其余的是镍币(5美分硬币)。他有至少一枚一分便士和一枚五分镍币。Ricardo可能拥有的最大金额和可能拥有的最小金额相差多少美分？",
    "options": [
      { "label": "A", "text": "8062" },
      { "label": "B", "text": "8068" },
      { "label": "C", "text": "8072" },
      { "label": "D", "text": "8076" },
      { "label": "E", "text": "8082" }
    ],
    "correct_answer": "C"
  },
  {
    "id": 9,
    "type": "multiple_choice",
    "subject": "几何",
    "difficulty": "medium",
    "content_en": "Akash's birthday cake is in the form of a $4 \\times 4 \\times 4$ inch cube. The cake has icing on the top and the four side faces, and no icing on the bottom. Suppose the cake is cut into 64 smaller cubes, each measuring $1 \\times 1 \\times 1$ inch, as shown below. How many small pieces will have icing on exactly two sides?",
    "content_zh": "Akash 的生日蛋糕是一个 $4 \\times 4 \\times 4$ 的正方体(边长单位：英寸)。这个立方体的顶部和 4 个侧面都有冰覆盖，但底面没有。假设这个正方体被分成 64 个 $1 \\times 1 \\times 1$ 英寸的小正方体，如下图所示。那么这些小正方体中有多少个恰好两面有冰？",
    "image_path": "images/question-09.png",
    "options": [
      { "label": "A", "text": "12" },
      { "label": "B", "text": "16" },
      { "label": "C", "text": "18" },
      { "label": "D", "text": "20" },
      { "label": "E", "text": "24" }
    ],
    "correct_answer": "D"
  },
  {
    "id": 10,
    "type": "multiple_choice",
    "subject": "组合计数",
    "difficulty": "medium",
    "content_en": "Zara has a collection of 4 marbles: an Aggie, a Bumblebee, a Steelie, and a Tiger. She wants to display them in a row on a shelf, but does not want to put the Steelie and the Tiger next to one another. In how many ways can she do this?",
    "content_zh": "Zara 有 4 个玻璃球，分别叫 Aggie，Bumblebee，Steelie，和 Tiger。她想把它们在架子上排成一行，但不想让 Steelie 和 Tiger 相邻。那么她有多少种排列方法？",
    "options": [
      { "label": "A", "text": "6" },
      { "label": "B", "text": "8" },
      { "label": "C", "text": "12" },
      { "label": "D", "text": "18" },
      { "label": "E", "text": "24" }
    ],
    "correct_answer": "C"
  },
  {
    "id": 11,
    "type": "multiple_choice",
    "subject": "图表分析",
    "difficulty": "medium",
    "content_en": "After school, Maya and Naomi headed to the beach, 6 miles away. Maya decided to bike while Naomi took a bus. The graph below shows their journeys, indicating the time and distance traveled. What was the difference, in miles per hour, between Naomi's and Maya's average speeds?",
    "content_zh": "放学后，Maya 和 Naomi 出发去距学校 6 英里的沙滩。Maya 决定骑车去，而 Naomi 坐公交车去。下图展示了他们的行程，显示了时间和所走路程的关系。那么 Naomi 和 Maya 的平均速度之差是多少英里每小时？",
    "image_path": "images/question-11.png",
    "options": [
      { "label": "A", "text": "6" },
      { "label": "B", "text": "12" },
      { "label": "C", "text": "18" },
      { "label": "D", "text": "20" },
      { "label": "E", "text": "24" }
    ],
    "correct_answer": "E"
  },
  {
    "id": 12,
    "type": "multiple_choice",
    "subject": "数论",
    "difficulty": "medium",
    "content_en": "For a positive integer $n$, the factorial notation $n!$ represents the product of the integers from $n$ to 1. (For example, $6! = 6 \\cdot 5 \\cdot 4 \\cdot 3 \\cdot 2 \\cdot 1$.) What value of $N$ satisfies the following equation?\n$$5! \\cdot 9! = 12 \\cdot N!$$",
    "content_zh": "对一个正整数 $n$，符号 $n!$ 表示从 $n$ 到 1 的所有整数的乘积。(例如，$6! = 6 \\cdot 5 \\cdot 4 \\cdot 3 \\cdot 2 \\cdot 1$) 则 $N$ 为何值时，满足下面的方程？\n$$5! \\cdot 9! = 12 \\cdot N!$$",
    "options": [
      { "label": "A", "text": "10" },
      { "label": "B", "text": "11" },
      { "label": "C", "text": "12" },
      { "label": "D", "text": "13" },
      { "label": "E", "text": "14" }
    ],
    "correct_answer": "A"
  },
  {
    "id": 13,
    "type": "multiple_choice",
    "subject": "概率",
    "difficulty": "medium",
    "content_en": "Jamal has a drawer containing 6 green socks, 18 purple socks, and 12 orange socks. After adding more purple socks, Jamal noticed that there is now a 60% chance that a sock randomly selected from the drawer is purple. How many purple socks did Jamal add?",
    "content_zh": "Jamal 有个抽屉，内有 6 只绿色袜子，18 只紫色袜子，12 只橙色袜子。当加了更多紫色袜子后，Jamal 发现，从抽屉里随机抽取一只袜子，有 60% 的概率它是紫色的。那么 Jamal 加了多少只紫袜子？",
    "options": [
      { "label": "A", "text": "6" },
      { "label": "B", "text": "9" },
      { "label": "C", "text": "12" },
      { "label": "D", "text": "18" },
      { "label": "E", "text": "24" }
    ],
    "correct_answer": "B"
  },
  {
    "id": 14,
    "type": "multiple_choice",
    "subject": "统计",
    "difficulty": "medium",
    "content_en": "There are 20 cities in the County of Newton. Their populations are shown in the bar chart below. The average population of all the cities is indicated by the horizontal dashed line. Which of the following is closest to the total population of all 20 cities?",
    "content_zh": "牛顿县有 20 座城市。下面的条形图显示了各个城市的人口数。所有城市的平均人口数用一条水平虚线表示。以下哪一项最接近这 20 座城市的总人口？",
    "image_path": "images/question-14.jpg",
    "options": [
      { "label": "A", "text": "65,000" },
      { "label": "B", "text": "75,000" },
      { "label": "C", "text": "85,000" },
      { "label": "D", "text": "95,000" },
      { "label": "E", "text": "105,000" }
    ],
    "correct_answer": "D"
  },
  {
    "id": 15,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "easy",
    "content_en": "Suppose $15\\%$ of $x$ equals $20\\%$ of $y$. What percentage of $x$ is $y$?",
    "content_zh": "假设 $x$ 的 $15\\%$ 等于 $y$ 的 $20\\%$。那么 $x$ 的百分之几是 $y$？",
    "options": [
      { "label": "A", "text": "5" },
      { "label": "B", "text": "35" },
      { "label": "C", "text": "75" },
      { "label": "D", "text": "$133\\frac{1}{3}$" },
      { "label": "E", "text": "300" }
    ],
    "correct_answer": "C"
  },
  {
    "id": 16,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "hard",
    "content_en": "Each of the points $A, B, C, D, E$, and $F$ in the figure below represents a different digit from 1 to 6. Each of the five lines shown passes through some of these points. The digits along each line are added to produce five sums, one for each line. The total of the five sums is 47. What is the digit represented by B?",
    "content_zh": "下图中 $A, B, C, D, E$ 和 $F$ 中的每个点代表1到 6 之间的一个不同的数字。图中所示的 5 条直线，每条都会通过其中几个点。每条直线上的几个数字相加得到 5 个和，每条直线一个和。把这 5 个和相加，结果为 47。那么 B 代表的数字是多少？",
    "image_path": "images/question-16.png",
    "options": [
      { "label": "A", "text": "1" },
      { "label": "B", "text": "2" },
      { "label": "C", "text": "3" },
      { "label": "D", "text": "4" },
      { "label": "E", "text": "5" }
    ],
    "correct_answer": "E"
  },
  {
    "id": 17,
    "type": "multiple_choice",
    "subject": "数论",
    "difficulty": "medium",
    "content_en": "How many factors of 2020 have more than 3 factors? (As an example, 12 has 6 factors, namely $1, 2, 3, 4, 6$, and $12$)",
    "content_zh": "2020 有多少个因子，它们各自的因子个数都大于 3？(例如，12 有 6 个因子，即 $1, 2, 3, 4, 6$ 和 $12$)",
    "options": [
      { "label": "A", "text": "6" },
      { "label": "B", "text": "7" },
      { "label": "C", "text": "8" },
      { "label": "D", "text": "9" },
      { "label": "E", "text": "10" }
    ],
    "correct_answer": "B"
  },
  {
    "id": 18,
    "type": "multiple_choice",
    "subject": "几何",
    "difficulty": "medium",
    "content_en": "Rectangle $ABCD$ is inscribed in a semicircle with diameter $\\overline{FE}$, as shown in the figure. Let $DA = 16$, and let $FD = AE = 9$. What is the area of $ABCD$?",
    "content_zh": "矩形 ABCD 内接在直径为 $\\overline{FE}$ 的半圆中，如图所示。已知 $DA = 16, FD = AE = 9$。则 ABCD 的面积是多少？",
    "image_path": "images/question-18.jpg",
    "options": [
      { "label": "A", "text": "240" },
      { "label": "B", "text": "248" },
      { "label": "C", "text": "256" },
      { "label": "D", "text": "264" },
      { "label": "E", "text": "272" }
    ],
    "correct_answer": "A"
  },
  {
    "id": 19,
    "type": "multiple_choice",
    "subject": "数论",
    "difficulty": "hard",
    "content_en": "A number is called flippy if its digits alternate between two distinct digits. For example, 2020 and 37373 are flippy, but 3883 and 123123 are not. How many five-digit flippy numbers are divisible by 15?",
    "content_zh": "若一个数的各个位上数字在 2 个不同的数字之间交替出现，那么这个数称为 flippy。例如，2020 和 37373 都是 flippy 数，但是 3883 和 123123 不是。有多少个 5 位 flippy 数能被 15 整除？",
    "options": [
      { "label": "A", "text": "3" },
      { "label": "B", "text": "4" },
      { "label": "C", "text": "5" },
      { "label": "D", "text": "6" },
      { "label": "E", "text": "8" }
    ],
    "correct_answer": "B"
  },
  {
    "id": 20,
    "type": "multiple_choice",
    "subject": "代数",
    "difficulty": "hard",
    "content_en": "A scientist walking through a forest recorded as integers the heights of 5 trees standing in a row. She observed that each tree was either twice as tall or half as tall as the one to its right. Unfortunately some of her data was lost when rain fell on her notebook. Her notes are shown below, with blanks indicating the missing numbers. Based on her observations, the scientist was able to reconstruct the lost data. What was the average height of the trees, in meters?",
    "content_zh": "一个穿过森林的科学家将一排 5 棵树的高度都记录了下来，这 5 棵树的高度均为整数。她观察到，每棵树的高度要么是右边树高的 2 倍，要么是它的一半。不幸的是，由于雨水落在她的笔记本上，导致部分数据丢失。她的笔记如下图所示，空白部分表示丢失的数据。根据她的观察，这个科学家最终能够重建丢失的数据。那么这 5 棵树的平均高度是多少米？",
    "image_path": "images/question-20.png",
    "options": [
      { "label": "A", "text": "22.2" },
      { "label": "B", "text": "24.2" },
      { "label": "C", "text": "33.2" },
      { "label": "D", "text": "35.2" },
      { "label": "E", "text": "37.2" }
    ],
    "correct_answer": "B"
  },
  {
    "id": 21,
    "type": "multiple_choice",
    "subject": "组合计数",
    "difficulty": "hard",
    "content_en": "A game board consists of 64 squares that alternate in color between black and white. The figure below shows square $P$ in the bottom row and square $Q$ in the top row. A marker is placed at $P$. A step consists of moving the marker onto one of the adjoining white squares in the row above. How many 7-step paths are there from $P$ to $Q$? (The figure shows a sample path.)",
    "content_zh": "一种游戏板由 64 个黑白相间的方块组成。下图显示了底行中的一个正方形 P 和顶行中的一个正方形 Q。在正方形 P 上放了一个标记，将标记移到上面一行中相邻的一个白色正方形上，这个操作称为一步。从 P 到 Q 有多少种 7 步路径？(图中显示了一种可能的示例路径)。",
    "image_path": "images/question-21.jpg",
    "options": [
      { "label": "A", "text": "28" },
      { "label": "B", "text": "30" },
      { "label": "C", "text": "32" },
      { "label": "D", "text": "33" },
      { "label": "E", "text": "35" }
    ],
    "correct_answer": "A"
  },
  {
    "id": 22,
    "type": "multiple_choice",
    "subject": "数论",
    "difficulty": "hard",
    "content_en": "When a positive integer $N$ is fed into a machine, the output is a number calculated according to the rule shown below. For example, starting with an input of $N=7$, the machine will output $3 \\cdot 7 + 1 = 22$. Then if the output is repeatedly inserted into the machine five more times, the final output is 26.\n$$7 \\rightarrow 22 \\rightarrow 11 \\rightarrow 34 \\rightarrow 17 \\rightarrow 52 \\rightarrow 26$$\nWhen the same 6-step process is applied to a different starting value of $N$, the final output is 1. What is the sum of all such integers $N$?",
    "content_zh": "当把一个正整数 N 输入一个机器，输出的是一个根据下面规则计算得到的数字。例如，一开始输入是 $N=7$，那么机器将输出 $3 \\cdot 7+1=22$。然后如果把输出再输入机器这样继续重复 5 次，那么最后的输出将是：\n$$7 \\rightarrow 22 \\rightarrow 11 \\rightarrow 34 \\rightarrow 17 \\rightarrow 52 \\rightarrow 26$$\n当把上述同样的 6 步过程再作用于另一个不同的初始值 N，最终的输出是1。那么 N 的所有可能值之和是多少？",
    "image_path_en": "images/question-22-en.jpg",
    "image_path_zh": "images/question-22-zh.jpg",
    "options": [
      { "label": "A", "text": "73" },
      { "label": "B", "text": "74" },
      { "label": "C", "text": "75" },
      { "label": "D", "text": "82" },
      { "label": "E", "text": "83" }
    ],
    "correct_answer": "E"
  },
  {
    "id": 23,
    "type": "multiple_choice",
    "subject": "组合计数",
    "difficulty": "medium",
    "content_en": "Five different awards are to be given to three students. Each student will receive at least one award. In how many different ways can the awards be distributed?",
    "content_zh": "把 5 个不同的奖章分配给 3 个学生，每个学生得到至少一个奖章。那么一共有多少种不同的分配方法？",
    "options": [
      { "label": "A", "text": "120" },
      { "label": "B", "text": "150" },
      { "label": "C", "text": "180" },
      { "label": "D", "text": "210" },
      { "label": "E", "text": "240" }
    ],
    "correct_answer": "B"
  },
  {
    "id": 24,
    "type": "multiple_choice",
    "subject": "几何",
    "difficulty": "hard",
    "content_en": "A large square region is paved with $n^2$ gray square tiles, each measuring $s$ inches on a side. A border $d$ inches wide surrounds each tile. The figure below shows the case for $n=3$. When $n=24$, the 576 gray tiles cover 64% of the area of the large square region. What is the ratio $\\frac{d}{s}$ for this larger value of $n$?",
    "content_zh": "一个大的正方形区域是用 $n^2$ 个灰色的方形瓷砖铺成的，每块的边长都是 $s$ 英寸。每一块瓷砖周围都有一个 $d$ 英寸宽的边框。下图显示了 $n=3$ 的情况。当 $n=24$，576 块灰色瓷砖覆盖了大正方形面积的 64%。对于这个较大的 n 值，$\\frac{d}{s}$ 的比值是多少？",
    "image_path": "images/question-24.png",
    "options": [
      { "label": "A", "text": "$\\frac{6}{25}$" },
      { "label": "B", "text": "$\\frac{1}{4}$" },
      { "label": "C", "text": "$\\frac{9}{25}$" },
      { "label": "D", "text": "$\\frac{7}{16}$" },
      { "label": "E", "text": "$\\frac{9}{16}$" }
    ],
    "correct_answer": "A"
  },
  {
    "id": 25,
    "type": "multiple_choice",
    "subject": "几何",
    "difficulty": "hard",
    "content_en": "Rectangles $R_{1}$ and $R_{2}$, and squares $S_{1}$, $S_{2}$, and $S_{3}$, shown below, combine to form a rectangle that is 3322 units wide and 2020 units high. What is the side length of $S_{2}$ in units?",
    "content_zh": "矩形 $R_1$ 和 $R_2$，正方形 $S_1$, $S_2$ 和 $S_3$，如下图所示，拼成了一个宽为 3322，高为 2020 的大矩形。求 $S_2$ 的边长是多少？",
    "image_path": "images/question-25.png",
    "options": [
      { "label": "A", "text": "651" },
      { "label": "B", "text": "655" },
      { "label": "C", "text": "656" },
      { "label": "D", "text": "662" },
      { "label": "E", "text": "666" }
    ],
    "correct_answer": "A"
  }
];

class TestEngine {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.isLoaded = false;
        
        // 绑定DOM元素
        this.questionTitle = document.getElementById('question-title');
        this.questionSubject = document.getElementById('question-subject');
        this.questionDifficulty = document.getElementById('question-difficulty');
        this.questionContentEn = document.getElementById('question-content-en');
        this.questionContentZh = document.getElementById('question-content-zh');
        this.optionsContainer = document.getElementById('options-container');
        this.questionNavGrid = document.getElementById('question-nav-grid');
        
        // 按钮元素
        this.prevBtn = document.getElementById('prev-btn');
        this.nextSubmitBtn = document.getElementById('next-submit-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.nextSubmitText = document.getElementById('next-submit-text');
        this.nextSubmitIcon = document.getElementById('next-submit-icon');
        
        // 进度显示元素
        this.progressDisplay = document.getElementById('progress-display');
        this.progressPercent = document.getElementById('progress-percent');
        this.progressBar = document.getElementById('progress-bar');
        
        // 模态框元素
        this.submitModal = document.getElementById('submit-modal');
        this.cancelSubmitBtn = document.getElementById('cancel-submit');
        this.confirmSubmitBtn = document.getElementById('confirm-submit');
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 初始化测试引擎
     */
    async initialize() {
        try {
            console.log('正在初始化测试引擎...');
            
            // 加载题目数据
            await this.loadQuestions();
            
            // 加载保存的答案
            this.loadSavedAnswers();
            
            // 生成题目导航
            this.generateQuestionNavigation();
            
            // 显示第一题
            this.showQuestion(0);
            
            // 更新进度显示
            this.updateProgress();
            
            this.isLoaded = true;
            console.log('测试引擎初始化完成');
            
        } catch (error) {
            console.error('测试引擎初始化失败:', error);
            alert('题目加载失败，请刷新页面重试');
        }
    }

    /**
     * 加载题目数据（使用内嵌数据）
     */
    async loadQuestions() {
        try {
            // 使用内嵌的题目数据，解决CORS问题
            this.questions = QUESTIONS_DATA;
            console.log('成功加载', this.questions.length, '道题目（内嵌数据）');
            
        } catch (error) {
            console.error('加载题目失败:', error);
            throw error;
        }
    }

    /**
     * 加载保存的答案
     */
    loadSavedAnswers() {
        try {
            const saved = localStorage.getItem('amc8_test_answers');
            this.answers = saved ? JSON.parse(saved) : {};
            
            const answerCount = Object.keys(this.answers).filter(key => !key.startsWith('_')).length;
            console.log('加载了', answerCount, '个已保存的答案');
            
        } catch (error) {
            console.error('加载答案失败:', error);
            this.answers = {};
        }
    }

    /**
     * 保存答案到本地存储
     */
    saveAnswers() {
        try {
            // 添加保存时间戳
            this.answers._lastSaved = new Date().toISOString();
            localStorage.setItem('amc8_test_answers', JSON.stringify(this.answers));
            
            console.log('答案已保存');
            
            // 显示保存成功提示
            this.showSaveSuccess();
            
        } catch (error) {
            console.error('保存答案失败:', error);
            alert('保存失败，请检查浏览器存储设置');
        }
    }

    /**
     * 自动保存
     */
    autoSave() {
        this.saveAnswers();
    }

    /**
     * 生成题目导航网格
     */
    generateQuestionNavigation() {
        this.questionNavGrid.innerHTML = '';
        
        for (let i = 0; i < this.questions.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'question-nav-btn';
            btn.textContent = i + 1;
            btn.setAttribute('data-question', i);
            
            // 设置状态样式
            this.updateNavButtonState(btn, i);
            
            // 点击事件
            btn.addEventListener('click', () => {
                this.showQuestion(i);
            });
            
            this.questionNavGrid.appendChild(btn);
        }
    }

    /**
     * 更新导航按钮状态
     */
    updateNavButtonState(btn, questionIndex) {
        const isAnswered = this.answers.hasOwnProperty((questionIndex + 1).toString());
        const isCurrent = questionIndex === this.currentQuestionIndex;
        
        btn.classList.remove('current', 'answered');
        
        if (isCurrent) {
            btn.classList.add('current');
        } else if (isAnswered) {
            btn.classList.add('answered');
        }
    }

    /**
     * 显示指定题目
     */
    showQuestion(index) {
        if (index < 0 || index >= this.questions.length) {
            return;
        }
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        // 更新题目信息
        this.questionTitle.textContent = `第${index + 1}题`;
        this.questionSubject.textContent = question.subject;
        
        // 难度显示
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等', 
            'hard': '困难'
        };
        this.questionDifficulty.textContent = difficultyMap[question.difficulty] || '中等';
        
        // 题目内容
        this.questionContentEn.innerHTML = question.content_en;
        this.questionContentZh.innerHTML = question.content_zh;
        
        
        // 处理图片显示
        this.displayQuestionImages(question);
        
        // 生成选项
        this.generateOptions(question);
        
        // 更新按钮状态
        this.updateNavigationButtons();
        
        // 更新导航状态
        this.updateQuestionNavigation();
        
        // 渲染数学公式 - 使用setTimeout确保DOM更新完成
        if (window.MathJax && window.MathJax.typesetPromise) {
            // 小延迟确保DOM完全更新
            setTimeout(() => {
                window.MathJax.typesetPromise([this.questionContentEn, this.questionContentZh, this.optionsContainer])
                    .then(() => {
                        // MathJax渲染完成后，确保样式一致性
                        this.ensureMathJaxConsistency();
                    })
                    .catch(error => console.error('MathJax渲染失败:', error));
            }, 10);
        }
        
        console.log('显示题目', index + 1);
    }

    /**
     * 确保MathJax数学公式样式一致性
     */
    ensureMathJaxConsistency() {
        try {
            // 获取所有MathJax渲染的元素
            const mathElements = document.querySelectorAll('.MathJax, .mjx-chtml, .mjx-math');
            
            mathElements.forEach(element => {
                // 确保字体大小一致
                element.style.fontSize = '1rem';
                element.style.lineHeight = '1.6';
                element.style.color = 'inherit';
                
                // 内联数学公式的特殊处理
                if (element.getAttribute('display') === 'false' || element.style.display === 'inline') {
                    element.style.verticalAlign = 'baseline';
                    element.style.margin = '0';
                }
            });
            
        } catch (error) {
            console.warn('MathJax样式调整失败:', error);
        }
    }

    /**
     * 显示题目图片
     */
    displayQuestionImages(question) {
        // 获取图片容器元素
        const imageEnContainer = document.getElementById('question-image-en-container');
        const imageZhContainer = document.getElementById('question-image-zh-container');
        const imageEnElement = document.getElementById('question-image-en');
        const imageZhElement = document.getElementById('question-image-zh');
        
        // 重置图片显示状态
        if (imageEnContainer) imageEnContainer.classList.add('hidden');
        if (imageZhContainer) imageZhContainer.classList.add('hidden');
        
        // 处理普通图片（中英文共用）
        if (question.image_path) {
            if (imageZhContainer && imageZhElement) {
                imageZhElement.src = question.image_path;
                imageZhElement.onerror = () => {
                    console.warn('图片加载失败:', question.image_path);
                    imageZhContainer.classList.add('hidden');
                };
                imageZhElement.onload = () => {
                    imageZhContainer.classList.remove('hidden');
                };
            }
        }
        
        // 处理英文专用图片（第22题）
        if (question.image_path_en) {
            if (imageEnContainer && imageEnElement) {
                imageEnElement.src = question.image_path_en;
                imageEnElement.onerror = () => {
                    console.warn('英文图片加载失败:', question.image_path_en);
                    imageEnContainer.classList.add('hidden');
                };
                imageEnElement.onload = () => {
                    imageEnContainer.classList.remove('hidden');
                };
            }
        }
        
        // 处理中文专用图片（第22题）
        if (question.image_path_zh) {
            if (imageZhContainer && imageZhElement) {
                // 如果已经有普通图片，则不覆盖
                if (!question.image_path) {
                    imageZhElement.src = question.image_path_zh;
                    imageZhElement.onerror = () => {
                        console.warn('中文图片加载失败:', question.image_path_zh);
                        imageZhContainer.classList.add('hidden');
                    };
                    imageZhElement.onload = () => {
                        imageZhContainer.classList.remove('hidden');
                    };
                }
            }
        }
    }

    /**
     * 生成选项
     */
    generateOptions(question) {
        this.optionsContainer.innerHTML = '';
        
        question.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            
            const button = document.createElement('button');
            button.className = 'option-button w-full p-4 text-left rounded-lg font-medium';
            button.setAttribute('data-option', option.label);
            
            // 检查是否已选择
            const questionId = (this.currentQuestionIndex + 1).toString();
            if (this.answers[questionId] === option.label) {
                button.classList.add('selected');
            }
            
            // 选项内容
            button.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
                        ${option.label}
                    </div>
                    <div class="flex-1">
                        ${option.text}
                    </div>
                </div>
            `;
            
            // 点击事件
            button.addEventListener('click', () => {
                this.selectOption(option.label);
            });
            
            optionDiv.appendChild(button);
            this.optionsContainer.appendChild(optionDiv);
        });
    }

    /**
     * 选择选项
     */
    selectOption(optionLabel) {
        const questionId = (this.currentQuestionIndex + 1).toString();
        
        // 更新答案
        this.answers[questionId] = optionLabel;
        
        // 更新选项样式
        const optionButtons = this.optionsContainer.querySelectorAll('.option-button');
        optionButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.getAttribute('data-option') === optionLabel) {
                btn.classList.add('selected');
            }
        });
        
        // 自动保存
        this.saveAnswers();
        
        // 更新进度
        this.updateProgress();
        
        // 更新导航
        this.updateQuestionNavigation();
        
        console.log('选择选项:', optionLabel, '题目:', questionId);
    }

    /**
     * 上一题
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.showQuestion(this.currentQuestionIndex - 1);
        }
    }

    /**
     * 下一题
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        }
    }

    /**
     * 更新导航按钮状态
     */
    updateNavigationButtons() {
        // 上一题按钮
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // 下一题/提交按钮
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        
        if (isLastQuestion) {
            this.nextSubmitText.textContent = '提交测试';
            this.nextSubmitIcon.className = 'fas fa-check';
            this.nextSubmitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            this.nextSubmitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            this.nextSubmitText.textContent = '下一题';
            this.nextSubmitIcon.className = 'fas fa-chevron-right';
            this.nextSubmitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            this.nextSubmitBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }
    }

    /**
     * 更新题目导航状态
     */
    updateQuestionNavigation() {
        const navButtons = this.questionNavGrid.querySelectorAll('.question-nav-btn');
        navButtons.forEach((btn, index) => {
            this.updateNavButtonState(btn, index);
        });
    }

    /**
     * 更新进度显示
     */
    updateProgress() {
        const answeredCount = Object.keys(this.answers).filter(key => !key.startsWith('_')).length;
        const totalCount = this.questions.length;
        const percentage = Math.round((answeredCount / totalCount) * 100);
        
        this.progressDisplay.textContent = `${answeredCount}/${totalCount}`;
        this.progressPercent.textContent = `${percentage}%`;
        this.progressBar.style.width = `${percentage}%`;
    }

    /**
     * 提交测试
     */
    submitTest() {
        // 检查是否所有题目都已回答
        const answeredCount = Object.keys(this.answers).filter(key => !key.startsWith('_')).length;
        const totalCount = this.questions.length;
        
        if (answeredCount < totalCount) {
            const unansweredCount = totalCount - answeredCount;
            if (!confirm(`还有 ${unansweredCount} 道题未作答，确定要提交吗？`)) {
                return;
            }
        }
        
        // 显示确认模态框
        this.showSubmitModal();
    }

    /**
     * 显示提交确认模态框
     */
    showSubmitModal() {
        this.submitModal.classList.remove('hidden');
    }

    /**
     * 隐藏提交确认模态框
     */
    hideSubmitModal() {
        this.submitModal.classList.add('hidden');
    }

    /**
     * 确认提交
     */
    confirmSubmit() {
        // 添加提交时间戳
        this.answers._submitted = true;
        this.answers._submitTime = new Date().toISOString();
        
        // 保存答案
        this.saveAnswers();
        
        // 停止计时器
        if (window.timer) {
            window.timer.stop();
        }
        
        console.log('测试已提交');
        
        // 跳转到结果页面
        window.location.href = 'result.html';
    }

    /**
     * 强制提交（时间到）
     */
    forceSubmit() {
        this.answers._autoSubmitted = true;
        this.answers._submitTime = new Date().toISOString();
        this.saveAnswers();
        
        console.log('测试已自动提交');
        window.location.href = 'result.html';
    }

    /**
     * 保存进度
     */
    saveProgress() {
        this.saveAnswers();
    }

    /**
     * 显示保存成功提示
     */
    showSaveSuccess() {
        // 简单的视觉反馈
        const saveBtn = this.saveBtn;
        const originalText = saveBtn.innerHTML;
        
        saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>已保存';
        saveBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        saveBtn.classList.add('bg-green-500');
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.classList.remove('bg-green-500');
            saveBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        }, 2000);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航按钮
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        
        this.nextSubmitBtn.addEventListener('click', () => {
            if (this.currentQuestionIndex === this.questions.length - 1) {
                this.submitTest();
            } else {
                this.nextQuestion();
            }
        });
        
        // 保存按钮
        this.saveBtn.addEventListener('click', () => {
            this.saveAnswers();
        });
        
        // 提交模态框
        this.cancelSubmitBtn.addEventListener('click', () => {
            this.hideSubmitModal();
        });
        
        this.confirmSubmitBtn.addEventListener('click', () => {
            this.hideSubmitModal();
            this.confirmSubmit();
        });
        
        // 点击模态框背景关闭
        this.submitModal.addEventListener('click', (e) => {
            if (e.target === this.submitModal) {
                this.hideSubmitModal();
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (!this.isLoaded) return;
            
            // 左右箭头键导航
            if (e.key === 'ArrowLeft' && !this.prevBtn.disabled) {
                this.previousQuestion();
            } else if (e.key === 'ArrowRight') {
                if (this.currentQuestionIndex === this.questions.length - 1) {
                    this.submitTest();
                } else {
                    this.nextQuestion();
                }
            }
            // 数字键选择选项
            else if (e.key >= '1' && e.key <= '5') {
                const optionLabels = ['A', 'B', 'C', 'D', 'E'];
                const optionIndex = parseInt(e.key) - 1;
                if (optionIndex < optionLabels.length) {
                    this.selectOption(optionLabels[optionIndex]);
                }
            }
            // Ctrl+S 保存
            else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveAnswers();
            }
        });
    }

    /**
     * 获取测试状态
     */
    getTestStatus() {
        const answeredCount = Object.keys(this.answers).filter(key => !key.startsWith('_')).length;
        const totalCount = this.questions.length;
        
        return {
            totalQuestions: totalCount,
            answeredQuestions: answeredCount,
            currentQuestion: this.currentQuestionIndex + 1,
            progress: Math.round((answeredCount / totalCount) * 100),
            answers: { ...this.answers }
        };
    }
}

// 导出类以供其他模块使用
window.TestEngine = TestEngine;