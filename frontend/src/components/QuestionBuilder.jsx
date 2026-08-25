import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import Label from "./Label";

function QuestionBuilder({
    title,
    badge,
    questions = [],
    questionLabel = "Pertanyaan",
    questionPlaceholder = "Tuliskan pertanyaan...",
    optionLabel = "Pilihan Jawaban",
    optionPlaceholder = "Masukkan teks jawaban...",
    itemLabel = "Draft Soal",
    addText = "Tambah Pertanyaan",
    onAdd,
    onRemove,
    onQuestionChange,
    onOptionChange,
}) {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-800">
                    <div className="h-6 w-1.5 rounded-full bg-[#0AC4E0]" />
                    {title}
                </h3>

                <span className="rounded-full bg-[#0AC4E0]/10 px-3 py-1 text-[10px] font-black text-[#0AC4E0]">
                    {badge}
                </span>
            </div>

            {questions.map((question, index) => (
                <QuestionCard
                    key={index}
                    index={index}
                    item={question}
                    itemLabel={itemLabel}
                    questionLabel={questionLabel}
                    questionPlaceholder={questionPlaceholder}
                    optionLabel={optionLabel}
                    optionPlaceholder={optionPlaceholder}
                    onRemove={onRemove}
                    onQuestionChange={onQuestionChange}
                    onOptionChange={onOptionChange}
                />
            ))}

            <Button
                text={addText}
                icon={<Plus size={20} strokeWidth={3} />}
                onClick={onAdd}
                className="!flex !w-full !items-center !justify-center !gap-3 !rounded-[2.5rem] !border-2 !border-dashed !border-[#0AC4E0]/30 !bg-white !py-6 !text-[11px] !font-black !uppercase !tracking-[0.2em] !text-[#0AC4E0] transition-all hover:!border-[#0AC4E0] hover:!bg-[#0AC4E0]/5 active:scale-[0.99]"
            />
        </section>
    );
}

QuestionBuilder.propTypes = {
    title: PropTypes.node,
    badge: PropTypes.node,
    questions: PropTypes.arrayOf(
        PropTypes.shape({
            question: PropTypes.string,
            options: PropTypes.arrayOf(PropTypes.string),
        }),
    ),
    questionLabel: PropTypes.string,
    questionPlaceholder: PropTypes.string,
    optionLabel: PropTypes.string,
    optionPlaceholder: PropTypes.string,
    itemLabel: PropTypes.string,
    addText: PropTypes.string,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onQuestionChange: PropTypes.func,
    onOptionChange: PropTypes.func,
};

function QuestionCard({
    index,
    item,
    itemLabel,
    questionLabel,
    questionPlaceholder,
    optionLabel,
    optionPlaceholder,
    onRemove,
    onQuestionChange,
    onOptionChange,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="group relative !m-0 overflow-hidden !rounded-[2.5rem] !border-2 !border-[#0AC4E0]/20 !bg-white !p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0AC4E0] text-sm font-black text-white shadow-lg shadow-[#0AC4E0]/30">
                            {index + 1}
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {itemLabel}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-400 transition-all hover:bg-red-500 hover:text-white active:scale-90"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <Label
                            text={questionLabel}
                            required
                            className="!ml-1 !text-[10px] !font-black !uppercase !tracking-widest !text-[#0AC4E0]"
                        />

                        <Input
                            placeholder={questionPlaceholder}
                            value={item.question}
                            onChange={(event) => onQuestionChange(index, event.target.value)}
                            className="!rounded-2xl !border-slate-200 !bg-white !px-6 !py-4 !text-[15px] !font-bold !text-slate-800 shadow-sm transition-all focus:!border-[#0AC4E0] focus:!ring-0"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 md:grid-cols-2">
                        {item.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="space-y-2">
                                <div className="ml-1 flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] font-black text-[#0AC4E0]">
                                        {String.fromCharCode(65 + optionIndex)}
                                    </span>

                                    <Label
                                        text={optionLabel}
                                        className="!mb-0 !text-[9px] !font-black !uppercase !tracking-widest !text-slate-400"
                                    />
                                </div>

                                <Input
                                    value={option}
                                    placeholder={optionPlaceholder}
                                    onChange={(event) =>
                                        onOptionChange(index, optionIndex, event.target.value)
                                    }
                                    className="!rounded-xl !border-transparent !bg-white !px-5 !py-3 !text-sm !font-semibold shadow-sm transition-all focus:!border-[#0AC4E0]/30"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

QuestionCard.propTypes = {
    index: PropTypes.number.isRequired,
    item: PropTypes.shape({
        question: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    itemLabel: PropTypes.string,
    questionLabel: PropTypes.string,
    questionPlaceholder: PropTypes.string,
    optionLabel: PropTypes.string,
    optionPlaceholder: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onQuestionChange: PropTypes.func.isRequired,
    onOptionChange: PropTypes.func.isRequired,
};

export default QuestionBuilder;
