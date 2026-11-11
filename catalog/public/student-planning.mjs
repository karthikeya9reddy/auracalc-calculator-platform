import { equation, sin, sout, positive, stepNumber as n } from './equation-definition.mjs';
import { CalculationError } from '../../src/calculation-core/index.mjs';
const fields=['Education, assessment, and learning'];
const input=(id,label,unit,max,semanticType)=>Object.freeze({...sin(id,label,unit,{max,allowMagnitudeWords:false}),semanticType});
export const studentPlanning=[equation({
  id:'final-exam-score-needed',title:'Final exam score needed',discipline:'Study planning',fields,category:'Grades and study planning',
  description:'Find the final exam percentage you need to reach a target course grade, with impossible targets made explicit.',
  keywords:['final grade','exam score','pass a class','what do I need on my final','weighted grade'],
  formula:'Required exam score = [target − current × (1 − weight/100)] / (weight/100).',
  citation:'Pearson, Final Grade Calculator: weighted-grade relationship and rearrangement for the required final score.',sourceUrl:'https://www.pearson.com/channels/calculators/final-grade-calculator',
  assumptions:['The current grade summarizes all completed work. Only the final exam remains. Percentages use a 0–100 scale.'],
  exclusions:['No grade curves, extra credit, dropped assessments, minimum-exam-score rules or institutional rounding.'],
  limitations:['A result above 100% means the target is unreachable within the stated model. A negative requirement means a zero would already meet the target.'],
  verificationCases:['80% current, 90% target and 50% final weight requires 100%.','84% current, 80% target and 25% final weight requires 68%.'],
  inputs:[input('current','Current course grade','%',100,'grade-percentage'),input('target','Target course grade','%',100,'grade-percentage'),input('weight','Final exam weight','%',100,'weight-percentage')],
  outputs:[Object.freeze({...sout('required','Required final exam score','percent'),semanticType:'grade-fraction'}),Object.freeze({...sout('maximum','Course grade with a 100% final','percent'),semanticType:'grade-fraction'})],
  solve(v){positive(v.weight,'weight','Final exam weight');const weight=v.weight/100,completed=v.current*(1-weight),required=(v.target-completed)/weight,maximum=completed+100*weight;
    return {outputs:{required:[required/100,'1'],maximum:[maximum/100,'1']},steps:[`Completed work contributes ${n(v.current)} × ${n(1-weight)} = ${n(completed)} percentage points.`,`The final must add ${n(v.target-completed)} points. Divide by its weight ${n(weight)}: ${n(required)}%.`,`Even 100% on the final gives ${n(maximum)}% overall.`],warnings:required>100?['This target requires more than 100% on the final and is not reachable without a different grading policy.']:required<=0?['A zero on the final would meet or exceed this target in this arithmetic model. Check attendance and minimum-score requirements.']:[]};}
}),equation({
  id:'target-gpa-needed',title:'GPA needed to reach your target',discipline:'Study planning',fields,category:'Grades and study planning',
  description:'Plan the average grade points needed across your next credits to reach a cumulative GPA target.',
  keywords:['gpa goal','raise gpa','cumulative gpa','college grades','grade point average'],
  formula:'Required future GPA = [target GPA × (completed credits + future credits) − current GPA × completed credits] / future credits.',
  citation:'University of Maryland Registrar: GPA is total quality points divided by GPA-bearing credits. This tool algebraically rearranges that relationship for a future-credit target; it does not implement institution-specific rules.',
  sourceUrl:'https://registrar.umd.edu/grades-records/grades/gpa-calculation',
  assumptions:['All entered credits count toward GPA on one consistent numeric grade-point scale. Future courses add credits without replacing old grades.'],
  exclusions:['No repeat-course forgiveness, transfer exclusions, pass/fail, weighted bonus points or institution-specific truncation.'],
  limitations:['A rounded current GPA changes the estimate. Use the most precise GPA available and confirm the credit policy with your school.'],
  verificationCases:['Current 3.0 over 60 credits, target 3.2 and 30 future credits requires 3.6.','With no completed credits the required future GPA equals the target.'],
  inputs:[input('current','Current cumulative GPA','grade points',10,'grade-points'),input('completed','Completed GPA-bearing credits','credits',1e6,'academic-credits'),input('target','Target cumulative GPA','grade points',10,'grade-points'),input('future','Future GPA-bearing credits','credits',1e6,'academic-credits'),input('scale','Maximum GPA on your scale','grade points',10,'grade-points')],
  outputs:[Object.freeze({...sout('required','Required average GPA in future credits'),semanticType:'grade-points'}),Object.freeze({...sout('maximum','Highest possible cumulative GPA'),semanticType:'grade-points'})],
  solve(v){positive(v.future,'future','Future credits');positive(v.scale,'scale','Maximum GPA');if(v.current>v.scale||v.target>v.scale)throw new CalculationError('GPA_EXCEEDS_SCALE','Current and target GPA cannot exceed your maximum grade-point scale.');const total=v.completed+v.future,earned=v.current*v.completed,required=(v.target*total-earned)/v.future,maximum=(earned+v.scale*v.future)/total;
    return {outputs:{required:[required,'1'],maximum:[maximum,'1']},steps:[`Completed quality points = ${n(v.current)} × ${n(v.completed)} = ${n(earned)}.`,`The target needs ${n(v.target)} × ${n(total)} = ${n(v.target*total)} total quality points.`,`Subtract earned points and divide by ${n(v.future)} future credits: required average ${n(required)}.`,`With the maximum ${n(v.scale)} in all future credits, the cumulative GPA is ${n(maximum)}.`],warnings:required>v.scale?['The target is unreachable within these future credits on the selected scale.']:required<0?['Even zero grade points across future credits would exceed the target in this model.']:[]};}
})];
