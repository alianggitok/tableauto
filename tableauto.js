/**
 * @author wei.chen19.o
 */
Vue.component('table-auto', {
    template: `
        <table width="100%" cellspacing="0" cellpadding="0" class="wf-table">
            <caption v-if="title">{{title}}</caption>
            <tbody>
                <tr v-for="(col,c) in fields" :key="c">
                    <template v-for="(item,i) in col" v-if="item">
                        <!-- 表内 slot -->
                        <template v-if="item.type==='slot'">
                            <td :colspan="item.colspan||maxCols">
                                <slot :name="item.name"></slot>
                            </td>
                        </template>
                        <!-- 占位 无字段 -->
                        <template v-if="item==='hold'">
                            <td colspan="2"></td>
                        </template>
                        <!-- 无字段名的纯文本 -->
                        <template v-else-if="item.type==='singleText'">
                            <td :colspan="item.colspan||2">
                                <div :style="item.style">
                                    <div v-if="item.value" v-html="item.value"></div>
                                    <span v-if="item.tips" class="wf-table-field-tips" v-html="item.tips"></span>
                                </div>
                            </td>
                        </template>
                        <!-- 有效字段 -->
                        <template v-else-if="!item.skip">
                            <th :width="thWidth" :class="item.thClass">
                                <div class="wf-table-field-label">
                                    <div>
                                        <span v-html="item.label"></span>
                                        <template v-if="item.labelExt"><br/>{{item.labelExt}}</template>
                                    </div>
                                    <div v-if="item.required||showColon" class="wf-table-field-label-pointer">
                                        <span v-if="item.required" class="require-star">*</span>
                                        <span v-else>&nbsp;</span>
                                        <span v-if="showColon">:</span>
                                    </div>
                                </div>
                            </th>
                            <td :width="tdWidth" :colspan="item.colspan" :class="item.tdClass" :style="item.tdStyle">
                                <div class="wf-table-field-value" :style="item.style" :data-field-key="item.field">
                                    <div :style="item.elemStyle">
                                        <!-- 只读 -->
                                        <template v-if="item.readonly">
                                            <template v-if="['select','autocomplete','radio'].includes(item.type)">
                                                {{item.value||getOptionLabel(model[item.field],item).join('')}}
                                            </template>
                                            <template v-else-if="['checkbox'].includes(item.type)">
                                                <template v-if="item.value">{{item.value}}</template>
                                                <template v-else>
                                                    <p v-for="(ph,p) in getOptionLabel(model[item.field],item)" :key="p">{{ph}}</p>
                                                </template>
                                            </template>
                                            <template v-else>
                                                {{item.value||model[item.field]}}
                                            </template>
                                        </template>
                                        <template v-else-if="item.type==='html'">
                                            <div v-html="item.value"></div>
                                        </template>
                                        <!-- 各类型 -->
                                        <template v-else-if="item.type==='modal'">
                                            <div class="vac-box" :class="{...(item.class||{})}">
                                                <input
                                                    type="text"
                                                    :value="item.value||model[item.field]"
                                                    :class="{
                                                        'validate[required]':item.required,
                                                        ...(item.class||{})
                                                    }"
                                                    style="text-overflow:ellipsis;overflow:hidden"
                                                    readonly
                                                    :title="item.value||model[item.field]||item.placeholder"
                                                    :placeholder="item.placeholder"
                                                    autocomplete="off"
                                                />
                                                <input type="button" class="btn" value="..." :disabled="item.disabled" @click="event=>item.action?item.action(event):null" />
                                                <input
                                                    v-if="model[item.field]&&!item.disabled"
                                                    type="button" class="btn plain" value="X" title="clear"
                                                    @click="event=>{
                                                        model[item.field]='';
                                                        if(item.delete){
                                                            item.delete(event)
                                                        }
                                                    }"
                                                />
                                            </div>
                                        </template>
                                        <template v-else-if="item.type==='select'">
                                            <select v-if="item.options&&item.options.length"
                                                v-model="model[item.field]"
                                                :class="{
                                                    'validate[required]':item.required,
                                                    ...(item.class||{})
                                                }"
                                                :disabled="item.disabled"
                                                :placeholder="item.placeholder"
                                                :title="item.value||model[item.field]||item.placeholder"
                                                @change="event=>item.change?item.change(event):null"
                                            >
                                                <option value="">-- Pls Select --</option>
                                                <template v-for="(opt,o) in (item.options||[])">
                                                    <option :key="o" v-if="!opt.hidden"
                                                        :value="opt[getValueKey(item)]"
                                                        v-text="opt[getLabelKey(item)]">
                                                    </option>
                                                </template>
                                            </select>
                                        </template>
                                        <template v-else-if="item.type==='autocomplete'">
                                            <auto-complete
                                                v-model="model[item.field]"
                                                :data="item.options||[]"
                                                :value-key="getValueKey(item)"
                                                :label-key="getLabelKey(item)"
                                                :label-class="item.labelClass"
                                                :required="item.required"
                                                :disabled="item.disabled"
                                                :placeholder="item.placeholder"
                                                clearable
                                                style="width: 100%"
                                                @change="(value,data)=>item.change?item.change(value,data):null"
                                            ></auto-complete>
                                        </template>
                                        <template v-else-if="item.type==='number'">
                                            <input
                                                type="text"
                                                v-model="model[item.field]"
                                                :class="{
                                                    'validate[required]':item.required,
                                                    ...(item.class||{})
                                                }"
                                                v-number="item.option||{}"
                                                autocomplete="off"
                                                :disabled="item.disabled"
                                                :placeholder="item.placeholder"
                                                :title="item.value||model[item.field]||item.placeholder"
                                                @change="event=>item.change?item.change(event):null"
                                                @input="event=>item.input?item.input(event):null"
                                                @blur="event=>item.blur?item.blur(event):null"
                                            />
                                        </template>
                                        <template v-else-if="item.type==='get'">
                                            <div>{{item.get()}}</div>
                                        </template>
                                        <template v-else-if="item.type==='date'">
                                            <date-picker
                                                v-model="model[item.field]"
                                                :required="item.required"
                                                :disabled="item.disabled"
                                                :readonly="item.readonly"
                                                :options="item.options||{}"
                                                :class="item.class||{}"
                                                :placeholder="item.placeholder"
                                                @change="(value)=>item.change?item.change(value):null"
                                            ></date-picker>
                                        </template>
                                        <template v-else-if="item.type==='radio'">
                                            <div class="wf-checkbox-group" :class="{
                                                'wf-checkbox-group-row':item.direction!=='column',
                                                'wf-checkbox-group-column':item.direction==='column',
                                                ...(item.class||{})
                                            }">
                                                <template v-for="(opt,r) in (item.options||[])">
                                                    <label class="wf-checkbox" :key="r" v-if="!opt.hidden">
                                                        <input
                                                            type="radio"
                                                            v-model="model[item.field]"
                                                            :class="{
                                                                'validate[required]':item.required
                                                            }"
                                                            :name="item.field"
                                                            :value="opt[getValueKey(item)]"
                                                            :disabled="item.disabled"
                                                            @change="event=>item.change?item.change(event):null"
                                                        />
                                                        <span>{{opt[getLabelKey(item)]}}</span>
                                                    </label>
                                                    <template v-if="item.justify"><br/></template>
                                                </template>
                                            </div>
                                        </template>
                                        <template v-else-if="item.type==='checkbox'">
                                            <div class="wf-checkbox-group" :class="{
                                                'wf-checkbox-group-row':item.direction!=='column',
                                                'wf-checkbox-group-column':item.direction==='column',
                                                ...(item.class||{})
                                            }">
                                                <template v-for="(opt,r) in (item.options||[])">
                                                    <label class="wf-checkbox" :key="r" v-if="!opt.hidden">
                                                        <input
                                                            type="checkbox"
                                                            v-model="model[item.field]"
                                                            :class="{
                                                                'validate[required]':item.required
                                                            }"
                                                            :name="item.field"
                                                            :value="opt[getValueKey(item)]"
                                                            :disabled="item.disabled"
                                                            @change="event=>item.change?item.change(event):null"
                                                        />
                                                        <span>{{opt[getLabelKey(item)]}}</span>
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                        <template v-else-if="item.type==='textarea'">
                                            <textarea
                                                v-model="model[item.field]"
                                                :class="{
                                                    'validate[required]':item.required,
                                                    ...(item.class||{})
                                                }"
                                                style="min-height:60px;resize:vertical"
                                                :placeholder="item.placeholder"
                                                autocomplete="off"
                                                v-max-length="item.maxLength"
                                                :disabled="item.disabled"
                                                :rows="item.rows"
                                                v-replace="item.replace"
                                                @change="event=>item.change?item.change(event):null"
                                                @input="event=>item.input?item.input(event):null"
                                            ></textarea>
                                        </template>
                                        <template v-else-if="item.type==='input'||!item.type">
                                            <input
                                                type="text"
                                                v-model="model[item.field]"
                                                :class="{
                                                    'validate[required]':item.required,
                                                    ...(item.class||{})
                                                }"
                                                autocomplete="off"
                                                :placeholder="item.placeholder"
                                                :disabled="item.disabled"
                                                :title="item.value||model[item.field]||item.placeholder"
                                                v-replace="item.replace"
                                                @change="event=>item.change?item.change(event):null"
                                                @input="event=>item.input?item.input(event):null"
                                            />
                                        </template>
                                    </div>
                                    <span v-if="item.tips" class="wf-table-field-tips" v-html="item.tips"></span>
                                </div>
                            </td>
                        </template>
                    </template>
                </tr>
                <slot></slot>
            </tbody>
        </table>
    `,
    props: {
        model:{
            type: Object,
            default: ()=>({}),
            required:true
        },
        title: {
            type: String,
            default: ''
        },
        fields: {
            type: Array,
            default: ()=>{
                // 示例
                return [
                    // [ // 每个字段至少占据两个单元格，第一行决定一下各行的 colspan 的参考值
                    //     {
                    //         field: 'key1',
                    //         label: 'date',
                    //         type:'date', // input|modal|select|autocomplete|number|date|radio|textarea, 默认 input
                    //         readonly: false,
                    //         disabled:false,
                    //         required:true
                    //         skip:true // 跳过不渲染，既隐藏
                    //     },
                    //     {
                    //         field: 'key2',
                    //         label: 'select',
                    //         type:'select',
                    //         options: [], // 选项
                    //         optionRender: {
                    //             label: 'Comments', // 对应 option 文本的 key
                    //             value: 'DicValue', // 对应 option value 的 key
                    //         },
                    //     }
                    // ],
                    // [
                    //     {
                    //         field: 'key3',
                    //         label: 'number',
                    //         type:'number',
                    //         option:{ // v-number 指令的参数
                    //             decimal:3
                    //         }
                    //     },
                    //     {
                    //         field: 'key4',
                    //         label: 'modal',
                    //         value: '定制显示内容',
                    //         type:'modal',
                    //         action: () => {
                    //             this.showModal(); // 需在外部书写 modal 相关 ui，并在此处调取（打开） modal
                    //         },
                    //     }
                    // ],
                    // [
                    //     {
                    //         field: 'key5',
                    //         label: 'input',
                    //         colspan: 3 // 单行独占手动配置单元格合并值
                    //     }
                    // ],
                    // [
                    //     {
                    //         field: 'key6',
                    //         label: 'radio',
                    //         colspan: 3,
                    //         options: [ // radio 项
                    //             { label: 'Commitment', value: 'Opex' },
                    //             { label: 'WBS', value: 'Capex' },
                    //         ],
                    //     }
                    // ]
                ]
            }
        },
        thWidth:{
            type:String,
            default:'20%'
        },
        tdWidth:{
            type:String,
            default:'30%'
        },
        showColon:{
            type:Boolean,
            default:false
        }
    },
    data() {
        return {
        };
    },
    computed:{
        maxCols(){
            let max= this.fields.map(item=>{
                let size=0
                if(item instanceof Array){
                    size=item.length
                }
                return size
            })
            return (this.fields.length?Math.max(...max):0)*2
        }
    },
    mounted() {
    },
    methods: {
        getValueKey(item){
            return item.optionRender?item.optionRender.value:'value'
        },
        getLabelKey(item){
            return item.optionRender?item.optionRender.label:'label'
        },
        getOptionLabel(value,item){
            let matchKey=this.getValueKey(item)
            let returnKey=this.getLabelKey(item)

            let matched=(item.options||[]).filter(item=>{
                return (value||[]).includes(item[matchKey])
            })
            let labels=matched.map(item=>item[returnKey])
            // console.log('getOptionLabel',value,matched,labels)
            return labels
            // if(multi){
            // }else{
            //     let matched=(item.options||[]).find(item=>item[matchKey]===value)
            //     let label=''
            //     console.log('getOptionLabel',value,returnKey)
            //     if(matched){
            //         if(returnKey instanceof Array){
            //             console.log('getOptionLabel',value,returnKey)
            //             for(let i=0;i<returnKey.length;i+=1){
            //                 if(matched[returnKey[i]]){
            //                     label= matched[returnKey[i]]||''
            //                     break;
            //                 }
            //             }
            //         }else{
            //             label=matched[returnKey]
            //         }
            //     }
            //     return label
            // }
        }
    },
});
