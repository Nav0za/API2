const fs = require('fs');
let c = fs.readFileSync('app/pages/curriculums.vue', 'utf8');

// 1. Remove table headers for ท. and ป. in the structure tables (but not plan table)
// Plan table header has "text-center" without width, structure has w-[8%] or w-[10%]
c = c.replace(/<th class="px-2 py-2 font-bold text-center w-\[8\%\]">ท\.<\/th>\s*/g, '');
c = c.replace(/<th class="px-2 py-2 font-bold text-center w-\[8\%\]">ป\.<\/th>\s*/g, '');
c = c.replace(/<th class="px-2 py-1 font-bold text-center w-\[10\%\]">ท\.<\/th>\s*/g, '');
c = c.replace(/<th class="px-2 py-1 font-bold text-center w-\[10\%\]">ป\.<\/th>\s*/g, '');

// 2. Remove table cells for theory and practical in structure tables
c = c.replace(/<td class="px-2 py-2 text-center text-slate-600">\{\{ sub\.theory_hours \}\}<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-2 text-center text-slate-600">\{\{ sub\.practical_hours \}\}<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-1 text-center text-slate-600">\{\{ sub\.theory_hours \}\}<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-1 text-center text-slate-600">\{\{ sub\.practical_hours \}\}<\/td>\s*/g, '');

// 3. Remove footers sumTheory and sumPractical in structure tables
c = c.replace(/<td class="px-2 py-3 text-center">\{\{ sumTheory\(getSubjectsForCategory\(cat\.id_category\)\) \}\}\s*<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-3 text-center">\{\{ sumPractical\(getSubjectsForCategory\(cat\.id_category\)\) \}\}\s*<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-3 text-center">\{\{ sumTheory\(getSubjectsForCategory\(sub_cat\.id_category\)\) \}\}\s*<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-3 text-center">\{\{ sumPractical\(getSubjectsForCategory\(sub_cat\.id_category\)\) \}\}\s*<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-2 text-center">\{\{\s*sumTheory\(getSubjectsForCategory\(sub_sub_cat\.id_category\)\)\s*\}\}<\/td>\s*/g, '');
c = c.replace(/<td class="px-2 py-2 text-center">\{\{\s*sumPractical\(getSubjectsForCategory\(sub_sub_cat\.id_category\)\)\s*\}\}<\/td>\s*/g, '');

// 4. Remove grand total theory and practical display
c = c.replace(/<div class="text-center">\s*<div class="text-md text-indigo-500 uppercase">ท\.<\/div>\s*<div class="text-lg">\{\{ sumTheory\(getAllSubjectsInCategoryTree\(cat\.id_category\)\) \}\}<\/div>\s*<\/div>\s*/g, '');
c = c.replace(/<div class="text-center">\s*<div class="text-md text-indigo-500 uppercase">ป\.<\/div>\s*<div class="text-lg">\{\{ sumPractical\(getAllSubjectsInCategoryTree\(cat\.id_category\)\) \}\}<\/div>\s*<\/div>\s*/g, '');

fs.writeFileSync('app/pages/curriculums.vue', c);
console.log('Update complete');
