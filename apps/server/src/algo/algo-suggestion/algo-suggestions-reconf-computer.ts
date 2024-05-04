import { IAlgoFieldOther } from '../../models/algo/algo-field';
import { AlgoSuggestionDefaultComputer } from './algo-suggestions-default-computer';
import { AlgoSuggestionConfig } from './algo-suggestions-computer';

export interface AlgoSuggestionReconfConfig extends AlgoSuggestionConfig {
    similarityCoefficient: number;
    confidenceCoefficient: number;
}

export class AlgoSuggestionReconfComputer<
    Config extends AlgoSuggestionReconfConfig = AlgoSuggestionReconfConfig,
> extends AlgoSuggestionDefaultComputer<Config> {
    protected computeWeightForItem(
        similarOther: IAlgoFieldOther | undefined,
        confidenceOther: IAlgoFieldOther | undefined,
    ): number | null {
        let primaryOther: IAlgoFieldOther | undefined;
        let secondaryOther: IAlgoFieldOther | undefined;
        let primaryCoefficient: number;
        let secondaryCoefficient: number;

        if (this.config.selectUserType === 'confidence') {
            primaryOther = confidenceOther;
            secondaryOther = similarOther;
            primaryCoefficient = this.config.confidenceCoefficient;
            secondaryCoefficient = this.config.similarityCoefficient;
        } else {
            primaryOther = similarOther;
            secondaryOther = confidenceOther;
            primaryCoefficient = this.config.similarityCoefficient;
            secondaryCoefficient = this.config.confidenceCoefficient;
        }

        if (primaryOther) {
            if (secondaryOther) {
                return (
                    (primaryOther.score / primaryCoefficient + secondaryOther.score / secondaryCoefficient) /
                    (primaryCoefficient + secondaryCoefficient)
                );
            } else {
                return primaryOther.score;
            }
        }

        return null;
    }
}
